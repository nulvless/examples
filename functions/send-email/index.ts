import { createServerClient } from '@nulvless/nulvless-js';

const nulvless = createServerClient(Deno.env.get('NULVLESS_URL')!, Deno.env.get('PROJECT_SECRET_KEY')!);

const TEMPLATE = 'welcome';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Use POST.' }, { status: 405 });

  const authorization = req.headers.get('authorization');
  if (!authorization) return Response.json({ error: 'Sign in to call this function.' }, { status: 401 });

  const verified = await nulvless.auth.verify(undefined, { headers: { Authorization: authorization } });
  if (verified.error) return Response.json({ error: 'Your session is not valid. Sign in again.' }, { status: 401 });

  const { data: user } = await nulvless.auth.admin.users.get(verified.data.user.id);
  if (!user?.email) return Response.json({ error: 'Your account has no email address.' }, { status: 422 });

  const { error } = await nulvless.comms.email.send({
    to: user.email,
    template: TEMPLATE,
    params: { name: user.profile?.name ?? user.email },
  });
  if (error) return Response.json({ error: 'The email could not be sent.' }, { status: 502 });

  return Response.json({ sent: true });
}
