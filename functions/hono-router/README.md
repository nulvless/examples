# Router with Hono

One Edge Function, several routes: a tiny notes API built with
[Hono](https://hono.dev). Use it when an endpoint grows past a single handler.

| Route | What it does |
| --- | --- |
| `GET /notes` | Lists the notes |
| `GET /notes/:id` | Reads one note |
| `POST /notes` | Adds a note from `{ "text": "…" }` |

Notes are kept in memory to keep the example small. Each instance has its own
copy and loses it when it stops, so store real data in a database.

## Routes and the function URL

A request to `https://<project>.nulvless.co/functions/notes/notes/1` reaches the
function with its own name as the first path segment. `withoutFunctionPrefix`
removes it, so the routes are written as `/notes/1`, the same as anywhere else.

## Use it

```bash
nulvless functions new notes --template hono-router
nulvless functions deploy notes
```

## Try it

```bash
curl -X POST https://<project>.nulvless.co/functions/notes/notes \
  -H "content-type: application/json" -d '{"text":"Ship it"}'

curl https://<project>.nulvless.co/functions/notes/notes
```
