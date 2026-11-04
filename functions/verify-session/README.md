# Verify a user session

Answers `401` unless the request carries a valid access token of a user of your
project. Start from this function whenever an endpoint is only for signed-in
users.

## Use it

```bash
nulvless functions new me --template verify-session
nulvless secrets set PROJECT_SECRET_KEY --function me
```

`PROJECT_SECRET_KEY` is a secret key (`sk-…`) of your project, from **API keys**
in the console. `NULVLESS_URL` is set by Nulvless on every function.

## Try it

From your app, send the user's access token:

```ts
const token = await nulvless.auth.getAccessToken();

await fetch('https://<project>.nulvless.co/functions/me', {
  headers: { Authorization: `Bearer ${token}` },
});
```

```json
{ "user": "usr_…", "assurance_level": "aal1" }
```
