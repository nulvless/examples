import { createServerClient } from '@nulvless/nulvless-js';

const nulvless = createServerClient(Deno.env.get('NULVLESS_URL')!, Deno.env.get('PROJECT_SECRET_KEY')!);

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-sonnet-5-5';
const MAX_TOKENS = 1024;
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN');

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const corsHeaders: Record<string, string> = ALLOWED_ORIGIN
  ? {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'authorization, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      Vary: 'Origin',
    }
  : {};

function isConversation(value: unknown): value is ChatMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (message) =>
        (message?.role === 'user' || message?.role === 'assistant') && typeof message?.content === 'string',
    )
  );
}

function textDeltas(events: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let pending = '';

  return events.pipeThrough(new TextDecoderStream()).pipeThrough(
    new TransformStream<string, Uint8Array>({
      transform(chunk, controller) {
        const lines = (pending + chunk).split('\n');
        pending = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const event = JSON.parse(line.slice('data: '.length));
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      },
    }),
  );
}

function reply(body: unknown, status: number) {
  return Response.json(body, { status, headers: corsHeaders });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return reply({ error: 'Use POST.' }, 405);

  const authorization = req.headers.get('authorization');
  if (!authorization) return reply({ error: 'Sign in to chat.' }, 401);

  const verified = await nulvless.auth.verify(undefined, { headers: { Authorization: authorization } });
  if (verified.error) return reply({ error: 'Your session is not valid. Sign in again.' }, 401);

  const { messages } = await req.json().catch(() => ({}));
  if (!isConversation(messages)) {
    return reply({ error: 'Send { "messages": [{ "role": "user", "content": "…" }] }.' }, 400);
  }

  const upstream = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, messages, stream: true }),
  });
  if (!upstream.ok || !upstream.body) {
    console.error(`Anthropic answered ${upstream.status}: ${await upstream.text()}`);
    return reply({ error: 'The model is not available right now. Try again.' }, 502);
  }

  return new Response(textDeltas(upstream.body), {
    headers: { ...corsHeaders, 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  });
}
