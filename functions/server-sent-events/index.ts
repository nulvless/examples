const TICK_MS = 1000;
const TICKS = 10;

export default function handler(req: Request): Response {
  const encoder = new TextEncoder();
  const resumeFrom = Number(req.headers.get('last-event-id') ?? 0);
  let timer: ReturnType<typeof setInterval> | undefined;

  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      let id = resumeFrom;
      const send = (event: string, data: unknown) =>
        controller.enqueue(encoder.encode(`id: ${++id}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`));

      send('ready', { ticks: TICKS, every_ms: TICK_MS });
      timer = setInterval(() => {
        send('tick', { at: new Date().toISOString() });
        if (id - resumeFrom > TICKS) {
          clearInterval(timer);
          send('done', {});
          controller.close();
        }
      }, TICK_MS);
    },
    cancel() {
      clearInterval(timer);
    },
  });

  return new Response(body, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache',
      'x-accel-buffering': 'no',
    },
  });
}
