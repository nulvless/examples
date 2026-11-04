# Auth with Vue

A Vue 3 single-page app on Vite, running entirely in the browser: email and
password sign-in, a route guard that sends signed-out visitors to the sign-in
page, and the signed-in user's profile.

- `src/lib/nulvless.ts` creates the one client every component shares.
- `src/router.ts` guards `/` with `auth.getSession`, which answers locally when
  nobody is signed in.
- `src/composables/useUser.ts` keeps the user in sync with the SDK's
  `signed-in`, `signed-out` and `unauthorized` events.

Route guards decide what renders. Your API still decides what is allowed: see
`api-express-rbac` for the server side.

## Use it

```bash
nulvless create my-app --example auth-vue
cd my-app
cp .env.example .env.local
npm install
npm run dev
```

Fill `.env.local` with your project URL and publishable key from **API keys**
in the console, then open http://localhost:5173.

## Learn more

- [Vue guide](https://www.nulvless.com/docs/frameworks/vue)
- [auth reference](https://www.nulvless.com/docs/sdk/auth)
