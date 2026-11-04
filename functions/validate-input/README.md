# Validate input

Never trust a request body. This function describes the expected body once,
with [zod](https://zod.dev), and gets back either typed data or an error per
field that your form can show next to each input.

## Use it

```bash
nulvless functions new signup --template validate-input
nulvless functions deploy signup
```

Change `SignupRequest` in `index.ts` to the body your endpoint expects.

## Try it

```bash
curl -X POST https://<project>.nulvless.co/functions/signup \
  -H "content-type: application/json" -d '{"email":"nope","seats":0}'
```

```json
{
  "error": "Some fields are not valid.",
  "fields": {
    "email": ["Invalid email address"],
    "name": ["Invalid input: expected string, received undefined"],
    "seats": ["Too small: expected number to be >=1"]
  }
}
```
