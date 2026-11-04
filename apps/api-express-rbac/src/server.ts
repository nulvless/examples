import express from 'express';
import { requireAuth, requireRole } from './middleware/auth.js';

const app = express();
app.use(express.json());

app.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.userId });
});

app.get('/orgs/:org/reports', requireRole(['owner', 'admin', 'member']), (req, res) => {
  res.json({ organization: req.params.org, reports: [] });
});

app.delete('/orgs/:org/members/:member', requireRole(['owner', 'admin']), (req, res) => {
  res.json({ organization: req.params.org, removed: req.params.member, by: req.userId });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
