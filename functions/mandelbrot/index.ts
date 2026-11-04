const PALETTE = ' .:-=+*#%@';
const LIMITS = { width: 200, height: 80, iterations: 500 };

function parameter(url: URL, name: string, fallback: number, max: number) {
  const value = Number(url.searchParams.get(name) ?? fallback);
  return Number.isFinite(value) ? Math.min(Math.max(Math.trunc(value), 2), max) : fallback;
}

function escapeTime(cr: number, ci: number, maxIterations: number) {
  let zr = 0;
  let zi = 0;
  let iteration = 0;

  while (iteration < maxIterations && zr * zr + zi * zi < 4) {
    [zr, zi] = [zr * zr - zi * zi + cr, 2 * zr * zi + ci];
    iteration += 1;
  }
  return iteration;
}

export default function handler(req: Request): Response {
  const url = new URL(req.url);
  const width = parameter(url, 'w', 80, LIMITS.width);
  const height = parameter(url, 'h', 32, LIMITS.height);
  const maxIterations = parameter(url, 'i', 80, LIMITS.iterations);

  const started = performance.now();
  const rows: string[] = [];

  for (let row = 0; row < height; row++) {
    const ci = -1.2 + (row / (height - 1)) * 2.4;
    let line = '';
    for (let column = 0; column < width; column++) {
      const cr = -2.5 + (column / (width - 1)) * 3.5;
      const iterations = escapeTime(cr, ci, maxIterations);
      line += PALETTE[Math.floor((iterations / maxIterations) * (PALETTE.length - 1))];
    }
    rows.push(line);
  }

  return new Response(`${rows.join('\n')}\n`, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'server-timing': `render;dur=${(performance.now() - started).toFixed(1)}`,
    },
  });
}
