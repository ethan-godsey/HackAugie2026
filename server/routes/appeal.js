import { Router } from 'express';
import { z } from 'zod';
import { generateAppealLetter } from '../services/claudeService.js';
import { checkParity } from '../services/parityChecker.js';
export const appealRouter = Router();
const Schema = z.object({
  patientName: z.string(), insurerName: z.string(), planId: z.string(),
  cptCode: z.string(), denialDate: z.string(), denialReason: z.string(),
  planType: z.string(), therapistName: z.string().optional(), diagnosisCode: z.string().optional()
});
appealRouter.post('/generate', async (req, res) => {
  const p = Schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.flatten() });
  const { cptCode, denialReason, planType, ...rest } = p.data;
  const parity = checkParity({ cptCode, denialReason, planType });
  if (!parity.cptInfo) return res.status(400).json({ error: 'CPT code not found' });
  try {
    const letter = await generateAppealLetter({
      ...rest, cptCode, denialReason,
      cptName: parity.cptInfo.name,
      statute: parity.statute, statuteNote: parity.statuteNote,
      parityTrigger: parity.cptInfo.parityTrigger,
      medicalEquivalent: parity.cptInfo.medicalEquivalent,
      medicalEquivalentName: parity.cptInfo.medicalEquivalentName
    });
    res.json({ letter, verdict: parity.verdict, statute: parity.statute });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
