# Contributing

Thanks for helping. An example here is copied into real projects, so it should
work on the first try and teach one thing well.

## What makes a good example

- **One idea.** A function does one job; an app shows one feature end to end.
  Prefer two small examples to one that does everything.
- **Runs as it is.** No placeholders in code. Configuration comes from secrets
  or `.env.local`, and the README says where each value comes from.
- **Safe by default.** Verify tokens before trusting a request, never send
  mail or money to an address taken from the request, and never commit a secret.
- **Plain code, no comments.** Clear names do the explaining; the README covers
  the rest.

## Layout

```text
functions/<name>/        one Edge Function
  index.ts               the entrypoint
  deno.json              optional import map (npm:, jsr:)
  example.json           the manifest
  README.md              what it does, how to use and try it

apps/<name>/             a whole project
  example.json
  README.md
  .env.example           every variable the app reads, without values
```

Names are lowercase kebab-case. Functions are named after what they do
(`verify-session`); apps after the feature and framework (`auth-vue`).

A function folder may only hold files a Nulvless deploy accepts: `.ts`, `.tsx`,
`.js`, `.jsx`, `.mjs`, `deno.json` and `.npmrc`, plus its `README.md` and
`example.json`, which the CLI does not copy.

## The manifest

```json
{
  "$schema": "../../schema/example.schema.json",
  "title": "Verify a user session",
  "description": "Rejects requests without a valid access token from one of your project's users.",
  "kind": "function",
  "features": ["edge-functions", "auth"],
  "secrets": ["PROJECT_SECRET_KEY"]
}
```

`secrets` lists names only; the CLI tells people which ones to set after
installing. Set `minCliVersion` when the example needs a CLI feature newer than
the default. The full format is in [`schema/example.schema.json`](schema/example.schema.json).

## Before opening a pull request

Requires Node.js 22.18 or later, and Deno for functions.

```bash
npm install
npm run check            # manifests, names and files
npm run check:functions  # type-checks every function with Deno
npm run catalog          # regenerates catalog.json and the README table
npm test                 # tests of the scripts themselves
```

Commit the regenerated `catalog.json` and `README.md`. CI fails when they are
out of date.

For an app, also install and build it from its own folder.

## Reporting a problem

Open an issue with the example's name, what you ran and what happened. Security
problems go to the address in [SECURITY.md](SECURITY.md), not to issues.
