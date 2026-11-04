import { z } from 'zod';

const SignupRequest = z.object({
  email: z.email(),
  name: z.string().trim().min(1).max(80),
  plan: z.enum(['free', 'pro']).default('free'),
  seats: z.number().int().min(1).max(500).default(1),
});

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Use POST.' }, { status: 405 });

  const body = await req.json().catch(() => undefined);
  if (body === undefined) return Response.json({ error: 'Send a JSON body.' }, { status: 400 });

  const parsed = SignupRequest.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: 'Some fields are not valid.', fields: z.flattenError(parsed.error).fieldErrors },
      { status: 422 },
    );
  }

  return Response.json({ accepted: parsed.data }, { status: 201 });
}
