export default function handler(req: Request): Response {
  const name = new URL(req.url).searchParams.get('name') ?? 'world';

  return Response.json({ message: `Hello, ${name}!` });
}
