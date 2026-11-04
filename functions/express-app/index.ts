import express from 'express';

const PORT = 8000;

const api = express.Router();

api.get('/', (_req, res) => {
  res.json({ message: 'An Express app running as a Nulvless Edge Function.' });
});

api.get('/hello/:name', (req, res) => {
  res.json({ message: `Hello, ${req.params.name}!` });
});

api.post('/echo', (req, res) => {
  res.json({ received: req.body });
});

const app = express();
app.use(express.json());
app.use('/:function', api);
app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}.` });
});

app.listen(PORT);
