import { Hono } from 'hono';

interface Note {
  id: number;
  text: string;
}

const notes: Note[] = [{ id: 1, text: 'Notes live in memory, so each instance starts with this one.' }];

const app = new Hono();

app.get('/', (c) => c.json({ routes: ['GET /notes', 'GET /notes/:id', 'POST /notes'] }));

app.get('/notes', (c) => c.json(notes));

app.get('/notes/:id', (c) => {
  const note = notes.find((entry) => entry.id === Number(c.req.param('id')));
  return note ? c.json(note) : c.json({ error: 'There is no note with this id.' }, 404);
});

app.post('/notes', async (c) => {
  const { text } = await c.req.json().catch(() => ({}));
  if (typeof text !== 'string' || !text.trim()) return c.json({ error: 'Send { "text": "…" }.' }, 400);

  const note = { id: notes.length + 1, text: text.trim() };
  notes.push(note);
  return c.json(note, 201);
});

app.notFound((c) => c.json({ error: `No route for ${c.req.method} ${c.req.path}.` }, 404));

function withoutFunctionPrefix(req: Request) {
  const url = new URL(req.url);
  url.pathname = url.pathname.replace(/^\/[^/]+/, '') || '/';
  return new Request(url, req);
}

export default {
  fetch: (req: Request) => app.fetch(withoutFunctionPrefix(req)),
};
