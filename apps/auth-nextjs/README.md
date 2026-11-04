# Auth with Next.js

Email and password sign-in with the Nulvless SDK in a Next.js App Router app,
and a route handler that verifies the user's token before answering.

- `lib/nulvless.ts` is the browser client, with the publishable key.
- `lib/nulvless-server.ts` is the server client, with the secret key. It
  imports `server-only`, so the build fails if it ever reaches the browser.
- `app/api/me/route.ts` trusts nothing from the request until `auth.verify`
  says the token is valid.

## Use it

```bash
nulvless create my-app --example auth-nextjs
cd my-app
cp .env.example .env.local
npm install
npm run dev
```

Fill `.env.local` with your project URL and keys from **API keys** in the
console, then open http://localhost:3000 and sign in with a user of your
project.

## Learn more

- [Next.js guide](https://www.nulvless.com/docs/frameworks/nextjs)
- [API keys](https://www.nulvless.com/docs/api-keys)
