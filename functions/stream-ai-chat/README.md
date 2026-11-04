# Stream an AI chat

Sends a conversation to Claude and streams the answer back as plain text, chunk
by chunk, so your UI can show it while it is being written. Only signed-in
users of your project can call it, so your Anthropic key is never an open
proxy.

## Use it

```bash
nulvless functions new chat --template stream-ai-chat
nulvless functions deploy chat
nulvless secrets set PROJECT_SECRET_KEY --function chat
nulvless secrets set ANTHROPIC_API_KEY --function chat
```

Optional secrets:

| Secret | Default | What it does |
| --- | --- | --- |
| `ANTHROPIC_MODEL` | `claude-sonnet-5-5` | The model to call |
| `ALLOWED_ORIGIN` | none | Your app's origin, such as `https://app.acme.com`, to call it from the browser |

## Try it

```ts
const token = await nulvless.auth.getAccessToken();
const response = await fetch('https://<project>.nulvless.co/functions/chat', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: 'Write a haiku about the edge.' }] }),
});

const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader();
for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
  output.textContent += chunk.value;
}
```
