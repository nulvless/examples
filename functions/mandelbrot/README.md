# Mandelbrot

Draws the Mandelbrot set as ASCII art. It does nothing but arithmetic, which
makes it a quick way to feel how much CPU a single request gets, and to see the
cost in the `Server-Timing` header.

| Query | Default | Max | What it changes |
| --- | --- | --- | --- |
| `w` | 80 | 200 | Width in characters |
| `h` | 32 | 80 | Height in lines |
| `i` | 80 | 500 | Iterations per point: more detail, more CPU |

The limits keep a request inside the CPU time each invocation gets. Push `i` to
the maximum and watch `render` grow.

## Use it

```bash
nulvless functions new mandelbrot --template mandelbrot
nulvless functions deploy mandelbrot
```

## Try it

```bash
curl -i "https://<project>.nulvless.co/functions/mandelbrot?w=100&h=40&i=200"
```
