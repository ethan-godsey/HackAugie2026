import { Router } from 'express';
import { z } from 'zod';
import { checkParity } from '../services/parityChecker.js';
export const checkRouter = Router();
const Schema = z.object({ cptCode: z.string(), denialReason: z.string(), planType: z.string() });
checkRouter.post('/', (req, res) => {
  const p = Schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });
  res.json(checkParity(p.data));
});
