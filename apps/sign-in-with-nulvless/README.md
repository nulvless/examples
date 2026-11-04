# Sign in with Nulvless

The other side of the OAuth Server: a third-party app, "Acme Analytics", that
lets people sign in with their account on your Nulvless project. Plain Node.js,
no framework and no SDK, so every step of the flow is visible.

| File | Step |
| --- | --- |
| `src/oauth.ts` → `startSignIn` | Builds the authorize URL with `state` and a PKCE challenge |
| `src/server.ts` → `callback` | Checks `state`, then trades the code for tokens |
| `src/oauth.ts` → `fetchUserInfo` | Reads the claims the user agreed to share |

Sessions are kept in memory, so they end when the process restarts.

## Use it

1. In the console, open **OAuth Server**, turn it on, and add an application
   with the redirect URI `http://localhost:3000/callback`.
2. Create the app and fill in its settings:

   ```bash
   nulvless create acme-analytics --example sign-in-with-nulvless
   cd acme-analytics
   cp .env.example .env.local
   npm start
   ```

   `NULVLESS_ISSUER` is your project URL followed by `/auth`.
   `OAUTH_CLIENT_SECRET` stays empty for a public client.
3. Open http://localhost:3000 and choose **Sign in with Nulvless**.

Your project needs a consent screen. Without one, the authorize step has
nowhere to send the user; see
[Building the consent screen](https://www.nulvless.com/docs/oauth-server/consent-screen).

Node.js 22.18 or later runs the TypeScript directly, so there is no build step.

## Learn more

- [OAuth Server quickstart](https://www.nulvless.com/docs/oauth-server/quickstart)
- [Authorization flow](https://www.nulvless.com/docs/oauth-server/authorization-flow)
