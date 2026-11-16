# Account center with React

A React app on Vite that a SaaS can start from: email and password sign-up and
sign-in, a second-factor step when the account or the environment asks for
one, a home page for your product, and an account page where people see their
details, how they sign in and every device they are signed in on.

- `src/pages/SignIn.tsx` and `src/pages/SignUp.tsx` branch on the response:
  a challenge goes to `/verify`, a confirmation link goes to `/check-email`,
  and tokens go straight in.
- `src/pages/Verify.tsx` finishes any challenge with `auth.verifyChallenge`:
  an authenticator code, an SMS or email code, or the sign-up confirmation.
- `src/pages/Activate.tsx` confirms an account from the link in the sign-up
  email with `auth.activate`.
- `src/pages/Account.tsx` lists sessions with `auth.sessions.list` and ends
  them with `auth.sessions.revoke`. When the environment protects sessions
  with sudo mode, the request answers `protected_action_denied` and
  `src/components/SudoDialog.tsx` asks for a code before trying again.
- `src/lib/user.tsx` keeps the signed-in user in sync with the SDK's
  `signed-in`, `signed-out` and `unauthorized` events.

Changing the name, email or phone needs a secret key, so this browser-only app
shows them without editing them. Do those from your own server with
`auth.users.update` and the email and phone update calls.

## Use it

```bash
nulvless create my-app --example account-center-react
cd my-app
cp .env.example .env.local
npm install
npm run dev
```

Fill `.env.local` with your environment's URL and publishable key from **API
keys** in the console, then open http://localhost:5173.

New environments confirm sign-ups by link, and the link in the email points to
the confirmation URL set in the console. Open **Redirect URLs** and set the
confirmation URL to `http://localhost:5173/activate`, or the account cannot be
confirmed. Add `http://localhost:5173` to the redirect URLs as well, since
sign-in returns only to listed URLs.

## Try it

1. Create an account at `/sign-up` and confirm it with the code or link you
   receive.
2. Sign in from a second browser, then open **Account** in the first one: both
   sessions are listed, and the current one is marked **This device**.
3. Choose **Sign out** on the other session. If sudo mode protects sessions,
   type the code you receive. The other browser is signed out on its next
   request.

## Learn more

- [React guide](https://www.nulvless.com/docs/frameworks/react)
- [auth.sessions reference](https://www.nulvless.com/docs/sdk/sessions)
- [Sudo mode](https://www.nulvless.com/docs/guides/sudo)
