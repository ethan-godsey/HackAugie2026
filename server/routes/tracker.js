import { Router } from 'express';
export const trackerRouter = Router();
const appeals = new Map();
trackerRouter.post('/', (req, res) => {
  const id = `appeal_${Date.now()}`;
  const a = { id, ...req.body, status: 'submitted',
    submittedAt: new Date().toISOString(),
    history: [{ status: 'submitted', date: new Date().toISOString() }] };
  appeals.set(id, a);
  res.json(a);
});
trackerRouter.get('/', (_, res) => res.json([...appeals.values()]));
trackerRouter.get('/:id', (req, res) => {
  const a = appeals.get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json(a);
});
trackerRouter.patch('/:id/status', (req, res) => {
  const a = appeals.get(req.params.id);
  if (!a) return res.status(404).json({ error: 'Not found' });
  a.status = req.body.status;
  a.history.push({ status: req.body.status, date: new Date().toISOString() });
  res.json(a);
});
