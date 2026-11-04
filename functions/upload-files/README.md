# Upload files

Receives a `multipart/form-data` request, the format of an HTML form with a file
input, and checks every file before doing anything with it: only PNG, JPEG, WebP
and PDF, up to 5 MB each. Text fields come back as they were sent.

The function only reports what it received. Replace the `files.push` line with
the upload to your storage.

## Use it

```bash
nulvless functions new upload --template upload-files
nulvless functions deploy upload
```

Change `ACCEPTED_TYPES` and `MAX_FILE_BYTES` in `index.ts` to your limits.

## Try it

```bash
curl https://<project>.nulvless.co/functions/upload \
  -F "title=Receipt" -F "file=@receipt.pdf;type=application/pdf"
```

```json
{
  "fields": { "title": "Receipt" },
  "files": [{ "field": "file", "filename": "receipt.pdf", "type": "application/pdf", "bytes": 48213 }],
  "rejected": []
}
```

A request with any rejected file answers `422`.
