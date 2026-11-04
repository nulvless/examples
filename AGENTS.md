# Agent instructions

This repository holds Nulvless examples that the Nulvless CLI installs into
people's projects. `CONTRIBUTING.md` is the source of truth; this file is the
short version plus what agents most often get wrong.

## Commands

```bash
npm install
npm run check            # manifests, names and files
npm run check:functions  # deno check of every function
npm run catalog          # regenerates catalog.json, llms.txt and the README table
npm test                 # tests of the scripts
```

Run all four after any change and commit the regenerated files. CI fails when
`catalog.json`, `llms.txt` or the README table are stale.

## Writing an Edge Function

- Read the real API first: `npx @nulvless/cli docs sdk/auth`, `docs sdk/comms`,
  and so on. Never guess SDK method names.
- The handler receives a web `Request` and returns a `Response`:
  `export default function handler(req)`, `export default { fetch }` or
  `Deno.serve`. Node apps that call `listen()` also run.
- The request path starts with the function's own segment
  (`/<project>_<slug>/…`). Routers must drop it; see `hono-router` and
  `express-app`.
- Configuration comes from `Deno.env.get`. `NULVLESS_URL` is injected. Names
  starting with `NULVLESS_` or `NVL_`, and `EDGE_REGION`, are reserved, so the
  project's secret key is `PROJECT_SECRET_KEY`.
- Dependencies go in a `deno.json` import map with `npm:` or `jsr:` and a
  caret range. No `package.json` in a function.
- Every file sits next to `index.ts`. Subfolders are not deployed yet.
- Responses with `text/html` are served as plain text, so a function cannot
  serve a page.
- Verify the caller before acting for them: `nulvless.auth.verify` with the
  request's `Authorization` header.

## Writing an app

- It must install and build from its own folder with no other files: declare
  every dependency it imports, including types such as `@types/node`.
- `.env.example` lists every variable the app reads, without values.
- Keys that reach the browser are publishable keys (`pk-…`). Secret keys
  (`sk-…`) stay in server code.

## Style

- No code comments. Names explain the code; the README explains the rest.
- READMEs follow the same order: what it does, `## Use it`, `## Try it`.
- User-facing errors say what to do next and never mention infrastructure.
