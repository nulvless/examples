---
name: add-nulvless-example
description: Add a new Edge Function or app example to the Nulvless examples repository, with its manifest, README and regenerated catalog. Use when asked to create, port or contribute an example here.
---

# Add a Nulvless example

1. **Choose the kind and name.** A single endpoint is a function in
   `functions/<name>/`, named after what it does (`verify-session`). A whole
   project is an app in `apps/<name>/`, named `<feature>-<framework>`
   (`auth-vue`). Names are lowercase kebab-case and must not exist yet.

2. **Read the real API.** Run `npx @nulvless/cli docs` to list the pages and
   `npx @nulvless/cli docs <path>` for the ones the example uses. Copy method
   names and parameters from there.

3. **Write the code**, following `AGENTS.md`:
   - functions: `index.ts` and `deno.json`, with `npm:`/`jsr:` imports in it
     or `{ "imports": {} }`;
   - apps: a complete project with `package.json`, `.env.example` and
     `.gitignore`.

4. **Write `example.json`:**

   ```json
   {
     "$schema": "../../schema/example.schema.json",
     "title": "Short title in sentence case",
     "description": "One sentence on what it does.",
     "kind": "function",
     "features": ["edge-functions"],
     "secrets": []
   }
   ```

   `features` values come from `schema/example.schema.json`. List every secret
   the code reads, by name only.

5. **Write `README.md`:** what it does and why, `## Use it` with the
   `nulvless` commands including every `secrets set`, and `## Try it` with a
   request and its response.

6. **Verify:**

   ```bash
   npm run check && npm run check:functions && npm test
   npm run catalog
   ```

   For an app, also run `npm install && npm run build` (or `typecheck`) inside
   its folder from a clean checkout. For a function, run it with Deno against
   a few requests, including bad input.

7. **Add an app to CI:** append its folder name to the `app` matrix in
   `.github/workflows/check.yml`.
