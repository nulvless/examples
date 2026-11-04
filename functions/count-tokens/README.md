# Count tokens

Counts how many tokens a text uses, so your app can check a prompt against a
model's limit or estimate its cost before sending it. It runs
[tiktoken](https://github.com/openai/tiktoken), compiled to WebAssembly, inside
the function.

The encoders load once per instance and are reused by every request.

| Encoding | Used by |
| --- | --- |
| `o200k_base` (default) | Newer OpenAI models |
| `cl100k_base` | GPT-4 and GPT-3.5 |

Other providers tokenize differently, so treat the count as an estimate for
them.

## Use it

```bash
nulvless functions new count-tokens --template count-tokens
nulvless functions deploy count-tokens
```

## Try it

```bash
curl -X POST https://<project>.nulvless.co/functions/count-tokens \
  -H "content-type: application/json" -d '{"text":"Hello from the edge!"}'
```

```json
{ "encoding": "o200k_base", "characters": 20, "tokens": 5 }
```
