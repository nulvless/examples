const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);

interface Rejection {
  field: string;
  filename: string;
  reason: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Use POST with a form.' }, { status: 405 });

  const form = await req.formData().catch(() => null);
  if (!form) return Response.json({ error: 'Send multipart/form-data.' }, { status: 415 });

  const fields: Record<string, string> = {};
  const files = [];
  const rejected: Rejection[] = [];

  for (const [field, value] of form) {
    if (typeof value === 'string') {
      fields[field] = value;
      continue;
    }
    if (!ACCEPTED_TYPES.has(value.type)) {
      rejected.push({ field, filename: value.name, reason: `${value.type || 'unknown type'} is not accepted` });
      continue;
    }
    if (value.size > MAX_FILE_BYTES) {
      rejected.push({ field, filename: value.name, reason: `larger than ${MAX_FILE_BYTES / 1024 / 1024} MB` });
      continue;
    }
    files.push({ field, filename: value.name, type: value.type, bytes: value.size });
  }

  return Response.json({ fields, files, rejected }, { status: rejected.length ? 422 : 200 });
}
