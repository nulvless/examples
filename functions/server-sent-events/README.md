# Server-sent events

Keeps one response open and pushes events through it: a `ready` event, a `tick`
every second, then `done`. Each event has an `id`, so a browser that reconnects
sends `Last-Event-ID` and continues where it stopped. When the client goes away,
`cancel` stops the timer.

Use it as the starting point for progress updates, live counters or
notifications that only flow from the server to the browser.

## Use it

```bash
nulvless functions new events --template server-sent-events
nulvless functions deploy events
```

## Try it

```bash
curl -N https://<project>.nulvless.co/functions/events
```

```ts
const events = new EventSource('https://<project>.nulvless.co/functions/events');
events.addEventListener('tick', (event) => console.log(JSON.parse(event.data)));
events.addEventListener('done', () => events.close());
```

Close the stream on `done`. Otherwise `EventSource` reconnects, which is what
you want for a feed that never ends.
