import { get_encoding, type TiktokenEncoding } from 'tiktoken';

const ENCODINGS: TiktokenEncoding[] = ['o200k_base', 'cl100k_base'];
const MAX_TEXT_LENGTH = 100_000;
const encoders = new Map(ENCODINGS.map((name) => [name, get_encoding(name)]));

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Use POST with { "text": "…" }.' }, { status: 405 });

  const { text, encoding = 'o200k_base' } = await req.json().catch(() => ({}));
  if (typeof text !== 'string') return Response.json({ error: 'Send { "text": "…" }.' }, { status: 400 });
  if (text.length > MAX_TEXT_LENGTH) {
    return Response.json({ error: `Send at most ${MAX_TEXT_LENGTH} characters.` }, { status: 413 });
  }

  const encoder = encoders.get(encoding);
  if (!encoder) return Response.json({ error: `Use one of: ${ENCODINGS.join(', ')}.` }, { status: 400 });

  return Response.json({ encoding, characters: text.length, tokens: encoder.encode(text).length });
}
