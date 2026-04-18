import { Router } from 'express';
import { SEED_APPEALS } from '../data/seedData.js';

export const trackerRouter = Router();

const appeals = new Map();
let seedId = 0;
for (const a of SEED_APPEALS) {
  const id = `seed_${seedId++}`;
  appeals.set(id, { id, ...a });
}

trackerRouter.post('/', (req, res) => {
  const id = `appeal_${Date.now()}`;
  const a = {
    id, ...req.body, status: 'submitted',
    submittedAt: new Date().toISOString(),
    history: [{ status: 'submitted', date: new Date().toISOString() }],
  };
  appeals.set(id, a);
  res.json(a);
});

trackerRouter.get('/stats', (_, res) => {
  const all = [...appeals.values()];
  const total = all.length;
  const won   = all.filter(a => a.status === 'won').length;
  const filed = all.filter(a => ['appealed','won','lost'].includes(a.status)).length;
  const winRate = filed > 0 ? Math.round((won / filed) * 100) : 0;

  const byInsurer = {};
  for (const a of all) {
    const name = a.insurerName || 'Unknown';
    if (!byInsurer[name]) byInsurer[name] = { name, denials: 0, won: 0, lost: 0, appealed: 0 };
    byInsurer[name].denials++;
    if (a.status === 'won')      byInsurer[name].won++;
    if (a.status === 'lost')     byInsurer[name].lost++;
    if (a.status === 'appealed') byInsurer[name].appealed++;
  }

  const leaderboard = Object.values(byInsurer)
    .sort((a, b) => b.denials - a.denials)
    .map(ins => ({
      ...ins,
      winRate: (ins.won + ins.lost) > 0
        ? Math.round((ins.won / (ins.won + ins.lost)) * 100)
        : null,
    }));

  const byCpt = {};
  for (const a of all) {
    byCpt[a.cptCode] = (byCpt[a.cptCode] || 0) + 1;
  }
  const topCodes = Object.entries(byCpt)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => ({ code, count }));

  res.json({ total, won, winRate, leaderboard, topCodes });
});

trackerRouter.get('/', (_, res) => res.json([...appeals.values()].reverse()));

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
