import { Router } from 'express';
import { parseDenialLetter } from '../services/claudeService.js';

export const parseRouter = Router();

parseRouter.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim().length < 20) {
    return res.status(400).json({ error: 'Please provide the denial letter text.' });
  }
  try {
    const result = await parseDenialLetter(text);
    if (!result) return res.status(422).json({ error: 'Could not extract data from letter.' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
