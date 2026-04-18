import { CPT_DATABASE } from '../data/cptDatabase.js';

export function checkParity({ cptCode, denialReason, planType }) {
  const cpt = CPT_DATABASE[cptCode];
  if (!cpt) {
    return {
      verdict: "YELLOW",
      statute: "MHPAEA 29 CFR 2590.712",
      explanation: "CPT code not in database. General parity protections still apply.",
      cptInfo: null
    };
  }
  const { RED, YELLOW } = cpt.verdictLogic;
  const verdict = RED.includes(denialReason) ? "RED"
    : YELLOW.includes(denialReason) ? "YELLOW" : "GREEN";

  const explanations = {
    RED:    `This denial likely violates ${cpt.statute}. ${cpt.parityTrigger}. You have strong grounds to appeal.`,
    YELLOW: `This denial may violate parity law. Comparing your plan's rules against ${cpt.medicalEquivalentName} (CPT ${cpt.medicalEquivalent}) could reveal a violation.`,
    GREEN:  `This appears to be an administrative denial. A standard appeal addressing the specific reason should be your first step.`
  };

  return { verdict, statute: cpt.statute, statuteNote: cpt.statuteNote,
           explanation: explanations[verdict], cptInfo: cpt, appealTemplate: cpt.appealTemplate };
}
