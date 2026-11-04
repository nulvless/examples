import { createServerClient } from '@nulvless/nulvless-js';

const nulvless = createServerClient(Deno.env.get('NULVLESS_URL')!, Deno.env.get('PROJECT_SECRET_KEY')!);

export default async function handler(req: Request): Promise<Response> {
  const authorization = req.headers.get('authorization');
  if (!authorization) return Response.json({ error: 'Sign in to call this function.' }, { status: 401 });

  const { data, error } = await nulvless.auth.verify(undefined, { headers: { Authorization: authorization } });
  if (error) return Response.json({ error: 'Your session is not valid. Sign in again.' }, { status: 401 });

  return Response.json({ user: data.user.id, assurance_level: data.session.assurance_level });
}
