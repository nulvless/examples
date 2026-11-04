# Agent instructions

This repository holds Nulvless examples that the Nulvless CLI installs.
Read `CONTRIBUTING.md` first; it is the source of truth.

- Use the real SDK and platform APIs. Read them with `npx @nulvless/cli docs <path>`
  instead of guessing method names.
- Every example needs `example.json` and `README.md`; apps also need `.env.example`.
- Edge Functions read configuration with `Deno.env.get`. `NULVLESS_URL` is
  injected; names starting with `NULVLESS_` or `NVL_` are reserved.
- After any change run `npm run check`, `npm run check:functions` and
  `npm run catalog`, and commit the regenerated files.
- No code comments.
