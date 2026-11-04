import { createServerClient } from '@nulvless/nulvless-js';

const nulvless = createServerClient(Deno.env.get('NULVLESS_URL')!, Deno.env.get('PROJECT_SECRET_KEY')!);

const ALLOWED_ROLES = ['owner', 'admin'];

export default async function handler(req: Request): Promise<Response> {
  const authorization = req.headers.get('authorization');
  if (!authorization) return Response.json({ error: 'Sign in to call this function.' }, { status: 401 });

  const organization = new URL(req.url).searchParams.get('org');
  if (!organization) return Response.json({ error: 'Pass the organization as ?org=<slug>.' }, { status: 400 });

  const { data, error } = await nulvless.auth.verify(
    { resource: organization, roles: ALLOWED_ROLES },
    { headers: { Authorization: authorization } },
  );
  if (error) return Response.json({ error: `Only ${ALLOWED_ROLES.join(' or ')} can do this.` }, { status: 403 });

  return Response.json({ user: data.user.id, organization });
}
