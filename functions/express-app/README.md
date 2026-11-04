# Express app

Bring the Express code you already have. Nulvless runs an app that calls
`app.listen()` and sends every request of the function to it, so routers,
middleware and `req`/`res` work as they do on a server.

## Routes and the function URL

A request to `https://<project>.nulvless.co/functions/api/hello/ada` reaches
the app as `/<function>/hello/ada`. Mounting the router on `/:function` keeps
your routes written as `/hello/:name`.

The port passed to `listen` is not exposed; any value works.

## Use it

```bash
nulvless functions new api --template express-app
nulvless functions deploy api
```

## Try it

```bash
curl https://<project>.nulvless.co/functions/api/hello/ada
curl -X POST https://<project>.nulvless.co/functions/api/echo \
  -H "content-type: application/json" -d '{"ok":true}'
```

For a new endpoint, prefer the `hono-router` example: Hono is built on the same
`Request` and `Response` the platform uses, and starts faster.
