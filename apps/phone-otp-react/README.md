# Sign in by SMS with React

A React app on Vite with passwordless sign-in by phone: the person picks their
country, types their number, receives a 6-digit code by SMS and is signed in,
with no password.

- `src/components/PhoneStep.tsx` sends the code with `auth.signInWithOTP`,
  passing the phone as `{ country_code, number }`.
- `src/components/CodeStep.tsx` checks it with `auth.verifyChallenge`, lets the
  person ask for a new code after 30 seconds, and tells them to start over after
  too many wrong codes.
- `src/App.tsx` opens straight on the signed-in screen when the browser already
  holds a session.

The SMS is the platform's `phone-otp-verification` template, so you can change
its wording in **Communications → Templates**.

## Use it

```bash
nulvless create my-app --example phone-otp-react
cd my-app
cp .env.example .env.local
npm install
npm run dev
```

Fill `.env.local` with your environment's URL and publishable key from **API
keys** in the console. In **Authentication**, turn on sign-in with a one-time
code by phone and connect an SMS provider for the environment. Then open
http://localhost:5173.

## Try it

1. Choose your country, type your number and select **Text me a code**.
2. Type the code from the SMS. You land on the signed-in screen, with your
   phone number and user ID.
3. Reload the page: the session is still there. Select **Sign out** to start
   again.

## Learn more

- [auth.signInWithOTP](https://www.nulvless.com/docs/sdk/auth#signinwithotp)
- [Challenges](https://www.nulvless.com/docs/sdk/challenges)
