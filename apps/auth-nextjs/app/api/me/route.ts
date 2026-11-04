import { nulvlessServer } from '@/lib/nulvless-server';

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');
  if (!authorization) return Response.json({ error: 'Sign in first.' }, { status: 401 });

  const { data, error } = await nulvlessServer.auth.verify(undefined, { headers: { Authorization: authorization } });
  if (error) return Response.json({ error: 'Your session is not valid.' }, { status: 401 });

  return Response.json({ user: data.user.id, assuranceLevel: data.session.assurance_level });
}
