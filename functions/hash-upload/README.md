# Hash an upload

Reads the request body chunk by chunk as it arrives and feeds each chunk to a
SHA-256 hash. Memory stays flat whatever the file size, because the function
never holds more than one chunk.

Use the same loop to check a file against a known checksum, to count bytes
before accepting an upload, or to forward a large body somewhere else.

## Use it

```bash
nulvless functions new hash --template hash-upload
nulvless functions deploy hash
```

## Try it

```bash
curl -T video.mp4 https://<project>.nulvless.co/functions/hash
sha256sum video.mp4
```

```json
{ "sha256": "9f86d081884c7d65…", "bytes": 73400320, "chunks": 1120 }
```

Bodies over 100 MB answer `413`. Change `MAX_BYTES` for your limit.
