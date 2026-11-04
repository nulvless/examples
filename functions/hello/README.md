# Hello

The smallest Edge Function: it reads `name` from the query string and answers
with JSON.

## Use it

```bash
nulvless functions new hello --template hello
nulvless functions deploy hello
```

## Try it

```bash
curl "https://<project>.nulvless.co/functions/hello?name=Ada"
```

```json
{ "message": "Hello, Ada!" }
```

## Three ways to write a function

Every function receives a web standard `Request` and returns a `Response`. Pick
the shape that fits your code; they all behave the same.

A default export, as in this example:

```ts
export default function handler(req: Request): Response {
  return Response.json({ ok: true });
}
```

An object with `fetch`, the shape Hono and other routers export (see
`hono-router`):

```ts
export default {
  fetch(req: Request): Response {
    return Response.json({ ok: true });
  },
};
```

`Deno.serve`, for code written for Deno:

```ts
Deno.serve((req: Request) => Response.json({ ok: true }));
```

Node apps that call `listen()`, such as Express, run too (see `express-app`).

## What every function gets

- `Deno.env.get('NAME')` reads your secrets. `NULVLESS_URL`,
  `NULVLESS_FUNCTION_SLUG` and `NULVLESS_FUNCTION_VERSION` are always set.
- `npm:` and `jsr:` imports, directly or through a `deno.json` import map.
- The request path starts with the function's own segment: a request to
  `/functions/hello/a/b` reaches the code as `/<project>_hello/a/b`.
