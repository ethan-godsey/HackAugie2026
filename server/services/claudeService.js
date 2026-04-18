import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateAppealLetter(params) {
  const {
    patientName, insurerName, planId, cptCode, cptName,
    denialDate, denialReason, statute, statuteNote,
    parityTrigger, medicalEquivalent, medicalEquivalentName,
    therapistName  = '[Therapist Name]',
    diagnosisCode  = '[ICD-10 Code]',
  } = params;

  const prompt = `Write a formal health insurance appeal letter for a denied mental health claim.
Use EXACTLY the legal citations provided. Do not modify statute numbers.

PATIENT: ${patientName}
INSURER: ${insurerName} | Plan ID: ${planId}
DENIED: ${cptName} (CPT ${cptCode}) | Date: ${denialDate}
DENIAL REASON: ${denialReason}
PROVIDER: ${therapistName} | DIAGNOSIS: ${diagnosisCode}

LEGAL BASIS:
- Statute: ${statute}
- Rule: ${statuteNote}
- Parity argument: ${parityTrigger}
- Comparable medical service NOT denied: ${medicalEquivalentName} (CPT ${medicalEquivalent})

Write exactly 3 paragraphs:
1. Formal notice of appeal under MHPAEA for denial of CPT ${cptCode}
2. Cite ${statute} precisely. Argue insurer covers ${medicalEquivalentName} (CPT ${medicalEquivalent}) but applied more restrictive criteria to the equivalent mental health service — a direct parity violation
3. Demand written reversal within 30 days or escalation to state insurance commissioner and DOL EBSA complaint

Format as a formal letter with today's date. Be direct and cite law precisely.`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  return msg.content[0].text;
}

export async function parseDenialLetter(text) {
  const prompt = `You are a medical billing expert. Extract structured data from the insurance denial letter below.

Return ONLY valid JSON with these exact keys (use null if not found):
{
  "cptCode": "string or null — the CPT/procedure code that was denied",
  "denialReason": "one of: medical_necessity | visit_cap | prior_auth | documentation | not_covered | wrong_cpt | bundling_error | wrong_modifier | out_of_network | timely_filing | upcoding_flag | coordination | null",
  "insurerName": "string or null",
  "planId": "string or null — member ID or plan ID",
  "denialDate": "YYYY-MM-DD or null",
  "diagnosisCode": "ICD-10 code or null"
}

DENIAL LETTER:
${text}`;

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  });

  try {
    const raw = msg.content[0].text.trim();
    const json = raw.match(/\{[\s\S]*\}/)?.[0];
    return JSON.parse(json);
  } catch {
    return null;
  }
}
