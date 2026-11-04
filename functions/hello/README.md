# Hello

The smallest Edge Function: it reads `name` from the query string and answers
with JSON.

## Use it

```bash
nulvless functions new hello --template hello
```

## Try it

```bash
curl "https://<project>.nulvless.co/functions/hello?name=Ada"
```

```json
{ "message": "Hello, Ada!" }
```
