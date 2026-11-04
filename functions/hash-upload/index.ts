import { createHash } from 'node:crypto';

const MAX_BYTES = 100 * 1024 * 1024;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'PUT' && req.method !== 'POST') return Response.json({ error: 'Use PUT with a body.' }, { status: 405 });
  if (!req.body) return Response.json({ error: 'Send the file as the request body.' }, { status: 400 });

  const hash = createHash('sha256');
  let bytes = 0;
  let chunks = 0;

  for await (const chunk of req.body) {
    bytes += chunk.byteLength;
    chunks += 1;
    if (bytes > MAX_BYTES) {
      return Response.json({ error: `Send at most ${MAX_BYTES / 1024 / 1024} MB.` }, { status: 413 });
    }
    hash.update(chunk);
  }

  return Response.json({ sha256: hash.digest('hex'), bytes, chunks });
}
