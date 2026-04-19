import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { User, ClipboardList, Building2, Stethoscope, FileText, Check, Copy, Download, Lock, AlertCircle } from 'lucide-react';

const CPT_GROUPS = [
  { label: 'Diagnostic Evaluations', codes: [
    { code: '90791', label: '90791 — Psychiatric diagnostic evaluation' },
    { code: '90792', label: '90792 — Psychiatric evaluation with medical services' },
  ]},
  { label: 'Individual Therapy', codes: [
    { code: '90832', label: '90832 — Individual therapy, 30 min' },
    { code: '90833', label: '90833 — Therapy add-on, 30 min (with E/M)' },
    { code: '90834', label: '90834 — Individual therapy, 45 min' },
    { code: '90836', label: '90836 — Therapy add-on, 45 min (with E/M)' },
    { code: '90837', label: '90837 — Individual therapy, 60 min' },
    { code: '90838', label: '90838 — Therapy add-on, 60 min (with E/M)' },
  ]},
  { label: 'Family Therapy', codes: [
    { code: '90846', label: '90846 — Family therapy without patient, 50 min' },
    { code: '90847', label: '90847 — Family therapy with patient, 50 min' },
  ]},
  { label: 'Group Therapy', codes: [
    { code: '90853', label: '90853 — Group psychotherapy' },
  ]},
  { label: 'Crisis Therapy', codes: [
    { code: '90839', label: '90839 — Crisis psychotherapy, first 60 min' },
    { code: '90840', label: '90840 — Crisis psychotherapy, each additional 30 min' },
  ]},
  { label: 'Add-On Codes', codes: [
    { code: '90785', label: '90785 — Interactive complexity add-on' },
    { code: '90863', label: '90863 — Pharmacologic management add-on' },
  ]},
  { label: 'Psychiatric E/M Visits', codes: [
    { code: '99212', label: '99212 — Established patient visit, low complexity' },
    { code: '99213', label: '99213 — Established patient visit, moderate complexity' },
    { code: '99214', label: '99214 — Established patient visit, mod-high complexity' },
    { code: '99215', label: '99215 — Established patient visit, high complexity' },
  ]},
  { label: 'Psychological Testing', codes: [
    { code: '96130', label: '96130 — Psychological testing, first hour' },
    { code: '96131', label: '96131 — Psychological testing, each additional hour' },
    { code: '96136', label: '96136 — Neuropsychological test administration, 30 min' },
  ]},
  { label: 'Collaborative Care', codes: [
    { code: '99484', label: '99484 — General behavioral health integration' },
    { code: '99492', label: '99492 — Psychiatric collaborative care, initial' },
    { code: '99493', label: '99493 — Psychiatric collaborative care, subsequent' },
  ]},
  { label: 'Health Behavior', codes: [
    { code: '96156', label: '96156 — Health behavior assessment & intervention' },
    { code: '96158', label: '96158 — Health behavior intervention, individual' },
  ]},
  { label: 'Telehealth', codes: [
    { code: 'G0459', label: 'G0459 — Telehealth pharmacologic management' },
    { code: 'G2012', label: 'G2012 — Brief virtual check-in' },
  ]},
  { label: 'Substance Use Disorder', codes: [
    { code: 'H0004', label: 'H0004 — BH counseling and therapy (SUD)' },
    { code: 'H0005', label: 'H0005 — Alcohol/drug group counseling (SUD)' },
  ]},
];

const DENIAL_REASONS = [
  { value: 'medical_necessity', label: 'Not medically necessary' },
  { value: 'visit_cap',         label: 'Visit limit / session cap exceeded' },
  { value: 'prior_auth',        label: 'Prior authorization required or missing' },
  { value: 'documentation',     label: 'Insufficient documentation' },
  { value: 'not_covered',       label: 'Service not covered under plan' },
  { value: 'wrong_cpt',         label: 'Incorrect CPT code or mismatch' },
  { value: 'bundling_error',    label: 'Bundling / unbundling issue' },
  { value: 'wrong_modifier',    label: 'Missing or incorrect modifier' },
  { value: 'out_of_network',    label: 'Provider out of network' },
  { value: 'timely_filing',     label: 'Timely filing limit exceeded' },
  { value: 'upcoding_flag',     label: 'Flagged for potential upcoding' },
  { value: 'coordination',      label: 'Coordination of benefits issue' },
];

const PLAN_TYPES = ['PPO','HMO','EPO','HDHP','Medicaid','Medicare Advantage','Marketplace ACA','Employer self-funded','TRICARE'];

const INSURER_APPEALS_ADDRESS = {
  'unitedhealthcare': { name: 'UnitedHealthcare', addr: 'UnitedHealthcare Appeals\nP.O. Box 30432\nSalt Lake City, UT 84130' },
  'united':           { name: 'UnitedHealthcare', addr: 'UnitedHealthcare Appeals\nP.O. Box 30432\nSalt Lake City, UT 84130' },
  'uhc':              { name: 'UnitedHealthcare', addr: 'UnitedHealthcare Appeals\nP.O. Box 30432\nSalt Lake City, UT 84130' },
  'aetna':            { name: 'Aetna', addr: 'Aetna Member Appeals\nP.O. Box 981106\nEl Paso, TX 79998-1106' },
  'cigna':            { name: 'Cigna', addr: 'Cigna Healthcare Appeals\nP.O. Box 188016\nChattanooga, TN 37422' },
  'blue cross':       { name: 'Blue Cross Blue Shield', addr: 'BCBS Member Appeals Department\n(Address varies by state — check your EOB or call the member services number on your card)' },
  'bcbs':             { name: 'Blue Cross Blue Shield', addr: 'BCBS Member Appeals Department\n(Address varies by state — check your EOB or call the member services number on your card)' },
  'anthem':           { name: 'Anthem', addr: 'Anthem Blue Cross Blue Shield Appeals\nP.O. Box 105568\nAtlanta, GA 30348-5568' },
  'humana':           { name: 'Humana', addr: 'Humana Appeals Department\nP.O. Box 14546\nLexington, KY 40512-4546' },
  'kaiser':           { name: 'Kaiser Permanente', addr: 'Kaiser Permanente Member Appeals\n(Submit through your regional member portal or call 1-800-464-4000)' },
  'molina':           { name: 'Molina Healthcare', addr: 'Molina Healthcare Member Appeals\nP.O. Box 22668\nLong Beach, CA 90801' },
  'centene':          { name: 'Centene / WellCare', addr: 'Centene Appeals Department\nP.O. Box 5010\nTrenton, NJ 08638' },
  'wellcare':         { name: 'WellCare', addr: 'WellCare Appeals Department\nP.O. Box 31368\nTampa, FL 33631-3368' },
  'oscar':            { name: 'Oscar Health', addr: 'Oscar Health Appeals\n75 Varick Street, 8th Floor\nNew York, NY 10013' },
  'ambetter':         { name: 'Ambetter', addr: 'Ambetter Member Appeals\nP.O. Box 211298\nEagan, MN 55121' },
};

function lookupInsurer(name) {
  if (!name) return null;
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(INSURER_APPEALS_ADDRESS)) {
    if (key.includes(k)) return v;
  }
  return null;
}

function renderLetterHtml(letter) {
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return letter
    .replace(/\*\*(.*?)\*\*/g, (_, t) => `<strong>${esc(t)}</strong>`)
    .split(/\n{2,}/)
    .map(block => {
      const b = block.trim();
      if (!b) return '';
      const inner = b.split('\n').map(esc).join('<br>');
      return `<p>${inner}</p>`;
    })
    .join('\n');
}

function downloadPDF(letter, name, insurerName) {
  const body      = renderLetterHtml(letter);
  const safeName  = (name || 'Appeally').replace(/</g,'&lt;');
  const insurer   = lookupInsurer(insurerName);
  const addrHtml  = insurer
    ? insurer.addr.replace(/\n/g, '<br>')
    : `${(insurerName || 'Your Insurance Company').replace(/</g,'&lt;')}<br><em>Check your Explanation of Benefits (EOB) or call the member services number on your insurance card for the correct appeals mailing address.</em>`;

  const instructionsPage = `
  <div class="page-break"></div>
  <div class="instructions-page">
    <div class="inst-header">
      <div class="inst-logo">Appeally</div>
      <div class="inst-title">How to Submit Your Appeal</div>
      <div class="inst-sub">Choose the submission method that works best for you, then follow the steps below.</div>
    </div>

    <div class="submit-options">
      <div class="submit-option">
        <div class="submit-option-label">Option A — Online Portal</div>
        <p>Log in to your insurer's member portal and look for <strong>"File an Appeal"</strong> or <strong>"Appeals &amp; Grievances."</strong> Upload this PDF letter along with your supporting documents. Online submission gives you an instant confirmation number — save it.</p>
      </div>
      <div class="submit-option">
        <div class="submit-option-label">Option B — Print &amp; Mail</div>
        <p>Print this letter, sign it, and mail it via <strong>USPS Certified Mail with Return Receipt (Form 3811)</strong> to the insurer's appeals address on this page. The green receipt card is your legal proof of delivery.</p>
      </div>
    </div>

    <div class="step-list" style="margin-top:1.5rem">
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-body">
          <strong>Gather your enclosures</strong>
          <p>Include copies (not originals) of: your Explanation of Benefits (EOB), any supporting documentation from your treating provider, and prior authorization records if applicable.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-body">
          <strong>Submit via portal <em>or</em> certified mail</strong>
          <p><strong>Portal:</strong> Upload the signed PDF + enclosures through your insurer's member portal. Save the confirmation number.<br><strong>Mail:</strong> Print, sign, and send via USPS Certified Mail with Return Receipt to the address below.</p>
          <div class="addr-box">${addrHtml}</div>
        </div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-body">
          <strong>Keep a complete copy for your records</strong>
          <p>Save the signed letter, all enclosures, your portal confirmation number or certified mail receipt. If your appeal is denied again, this packet is your evidence for escalation.</p>
        </div>
      </div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-body">
          <strong>If no response within 30 days</strong>
          <p>File a complaint with the <strong>U.S. Department of Labor EBSA</strong> at <strong>dol.gov/EBSA</strong> or call 1-866-444-3272. Also file with your <strong>State Insurance Commissioner</strong>.</p>
        </div>
      </div>
    </div>

    <div class="inst-footer">Generated by Appeally &middot; Fight Denials. Win Your Rights. &middot; This document does not constitute legal advice.</div>
  </div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Appeal Letter — ${safeName}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.85;color:#111;max-width:7.5in;margin:0 auto;padding:1.1in 1.25in}
    p{margin-bottom:1em}
    strong{font-weight:bold}
    .footer{margin-top:2.5em;padding-top:1em;border-top:1px solid #ccc;font-size:9pt;color:#888;text-align:center;font-family:Arial,sans-serif}
    .print-btn{position:fixed;top:16px;right:16px;background:#1A68B3;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.18)}
    .print-btn:hover{background:#145091}

    /* Page break */
    .page-break{page-break-before:always;break-before:page}

    /* Instructions page */
    .instructions-page{font-family:Arial,Helvetica,sans-serif;padding:0}
    .inst-header{background:#1A68B3;color:#fff;padding:1.5rem 1.75rem;border-radius:8px;margin-bottom:1.75rem}
    .inst-logo{font-size:1rem;font-weight:700;opacity:.75;margin-bottom:.25rem;letter-spacing:.05em;text-transform:uppercase}
    .inst-title{font-size:1.45rem;font-weight:800;margin-bottom:.35rem}
    .inst-sub{font-size:.85rem;opacity:.85;line-height:1.5}
    .step-list{display:flex;flex-direction:column;gap:1.1rem}
    .step{display:flex;gap:1rem;align-items:flex-start}
    .step-num{width:28px;height:28px;border-radius:50%;background:#1A68B3;color:#fff;font-family:Arial,sans-serif;font-size:.8rem;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
    .step-body{flex:1;font-size:.88rem;line-height:1.6}
    .step-body strong{display:block;font-size:.95rem;margin-bottom:.25rem;color:#0D3460}
    .step-body p{margin:0;color:#333}
    .addr-box{margin-top:.5rem;padding:.75rem 1rem;background:#F0F7FF;border-left:3px solid #1A68B3;border-radius:0 6px 6px 0;font-size:.88rem;line-height:1.7;color:#0D3460;font-family:'Courier New',monospace}
    .submit-options{display:flex;gap:1rem;margin-bottom:.25rem}
    .submit-option{flex:1;border:1.5px solid #1A68B3;border-radius:8px;padding:.85rem 1rem;font-size:.85rem;line-height:1.6}
    .submit-option-label{font-weight:800;font-size:.82rem;color:#1A68B3;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.35rem}
    .submit-option p{margin:0;color:#333}
    .inst-footer{margin-top:2rem;padding-top:.75rem;border-top:1px solid #ddd;font-size:.72rem;color:#999;text-align:center;font-family:Arial,sans-serif}

    @media print{
      .no-print{display:none}
      @page{margin:1in;size:letter}
      .page-break{page-break-before:always;break-before:page;height:0}
      .instructions-page{padding-top:.5in}
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Save as PDF</button>
  <div class="letter-body">${body}</div>
  <div class="footer">Prepared by Appeally &middot; Fight Denials. Win Your Rights.</div>
  ${instructionsPage}
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  win?.addEventListener('unload', () => URL.revokeObjectURL(url));
}

export default function AppealPage() {
  // Fix: useLocation().state can be null (not undefined), so || {} is required
  const pre = useLocation().state || {};

  const [form, setForm] = useState({
    patientName:   '',
    address:       '',
    phone:         '',
    insurerName:   pre.cptInfo?.medicalEquivalentName ? '' : '',
    planId:        '',
    denialDate:    '',
    therapistName: '',
    diagnosisCode: '',
    cptCode:       pre.cptCode      || '',
    denialReason:  pre.denialReason || '',
    planType:      pre.planType     || '',
  });

  const { user } = useAuth();
  const [letter, setLetter]   = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [error, setError]     = useState('');
  const [saved, setSaved]     = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true); setLetter(''); setError(''); setSaved(false);
    try {
      const { data } = await axios.post('/api/appeal/generate', form);
      setLetter(data.letter);
      setTimeout(() => document.getElementById('letter-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      if (user) {
        try {
          await axios.post('/api/tracker', {
            patientName:  form.patientName,
            insurerName:  form.insurerName,
            planId:       form.planId,
            cptCode:      form.cptCode,
            denialDate:   form.denialDate,
            denialReason: form.denialReason,
            letter:       data.letter,
          });
          setSaved(true);
        } catch { /* silently skip if tracker save fails */ }
      }
    } catch {
      setError('Error generating letter. Check that ANTHROPIC_API_KEY is set in server/.env');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const fromCheck = !!(pre.cptCode || pre.denialReason);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Generate Appeal Letter</h1>
        <p className="page-sub">Fill in your information below. We'll draft a formal letter citing the exact MHPAEA federal statute. Ready to print and send.</p>
      </div>

      {fromCheck && (
        <div className="success-banner" style={{ marginBottom: '1rem' }}>
          <Check size={15} style={{ flexShrink: 0 }} />
          Claim details pre-filled from your parity check — review and complete the form below.
        </div>
      )}

      <form onSubmit={handleGenerate}>

        {/* Section 1: Your personal info */}
        <div className="card">
          <div className="card-title">
            <span className="card-icon"><User size={16} /></span>
            Your information
          </div>

          <div className="row">
            <div className="field">
              <label>Full name</label>
              <input value={form.patientName} onChange={set('patientName')} placeholder="Jane Smith" required />
            </div>
            <div className="field">
              <label>Phone number <span className="opt">(optional)</span></label>
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" />
            </div>
          </div>
          <div className="field">
            <label>Mailing address <span className="opt">(optional)</span></label>
            <input value={form.address} onChange={set('address')} placeholder="123 Main St, City, State 12345" />
          </div>
        </div>

        {/* Section 2: Claim details */}
        <div className="card">
          <div className="card-title">
            <span className="card-icon"><ClipboardList size={16} /></span>
            Claim &amp; denial details
          </div>

          <div className="field">
            <label>CPT code that was denied</label>
            <select value={form.cptCode} onChange={set('cptCode')} required>
              <option value="">Select the denied CPT code…</option>
              {CPT_GROUPS.map(g => (
                <optgroup key={g.label} label={g.label}>
                  {g.codes.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="row">
            <div className="field">
              <label>Reason given for denial</label>
              <select value={form.denialReason} onChange={set('denialReason')} required>
                <option value="">Select a reason…</option>
                {DENIAL_REASONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Insurance plan type</label>
              <select value={form.planType} onChange={set('planType')} required>
                <option value="">Select plan type…</option>
                {PLAN_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Date of denial</label>
            <input type="date" value={form.denialDate} onChange={set('denialDate')} required />
          </div>
        </div>

        {/* Section 3: Insurance details */}
        <div className="card">
          <div className="card-title">
            <span className="card-icon"><Building2 size={16} /></span>
            Insurance details
          </div>

          <div className="row">
            <div className="field">
              <label>Insurance company name</label>
              <input value={form.insurerName} onChange={set('insurerName')} placeholder="e.g. UnitedHealthcare" required />
            </div>
            <div className="field">
              <label>Plan / member ID</label>
              <input value={form.planId} onChange={set('planId')} placeholder="e.g. XYZ123456" required />
            </div>
          </div>
        </div>

        {/* Section 4: Provider info */}
        <div className="card">
          <div className="card-title">
            <span className="card-icon"><Stethoscope size={16} /></span>
            Provider details <span style={{ fontWeight: 400, fontSize: '.8rem', color: 'var(--text-3)', marginLeft: 4 }}>(optional but strengthens your letter)</span>
          </div>

          <div className="row">
            <div className="field">
              <label>Therapist / provider name</label>
              <input value={form.therapistName} onChange={set('therapistName')} placeholder="Dr. Sarah Lee, LCSW" />
            </div>
            <div className="field">
              <label>Diagnosis code (ICD-10)</label>
              <input value={form.diagnosisCode} onChange={set('diagnosisCode')} placeholder="e.g. F32.1" />
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? <><span className="spinner" /> Generating with AI…</> : 'Generate appeal letter →'}
        </button>
        {error && <p className="error-msg"><AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}</p>}
      </form>

      {/* Letter result */}
      {letter && (
        <div className="card" id="letter-result" style={{ marginTop: '1.5rem' }}>
          <div className="letter-header">
            <div className="card-title" style={{ margin: 0 }}>
              <span className="card-icon"><FileText size={16} /></span>
              Your appeal letter
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-sm" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy text</>}
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                onClick={() => downloadPDF(letter, form.patientName, form.insurerName)}
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>

          <div className="letter-box">{letter}</div>

          <div style={{
            marginTop: '1rem',
            padding: '10px 14px',
            background: 'var(--brand-50)',
            border: '1px solid var(--brand-light)',
            borderRadius: 'var(--r-s)',
            fontSize: '.78rem',
            color: 'var(--brand-dark)',
            lineHeight: 1.6,
          }}>
            <strong>Next steps:</strong> Print and send via certified mail to your insurer's appeals department. Keep a copy for your records. If denied again, escalate to your state insurance commissioner or file a complaint at <strong>dol.gov/EBSA</strong>.
          </div>

          {saved ? (
            <div style={{
              marginTop: '.75rem',
              padding: '10px 14px',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 'var(--r-s)',
              fontSize: '.82rem',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Check size={15} style={{ flexShrink: 0 }} />
              Appeal saved to your tracker.{' '}
              <Link to="/tracker" style={{ color: '#166534', fontWeight: 600 }}>View my appeals →</Link>
            </div>
          ) : !user ? (
            <div style={{
              marginTop: '.75rem',
              padding: '12px 14px',
              background: '#F8FAFF',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--r-s)',
              fontSize: '.82rem',
              color: 'var(--text-2)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}>
              <Lock size={14} style={{ flexShrink: 0 }} />
              <span>
                <Link to="/auth" state={{ tab: 'login' }} style={{ color: 'var(--brand)', fontWeight: 600 }}>Sign in</Link>
                {' '}or{' '}
                <Link to="/auth" state={{ tab: 'register' }} style={{ color: 'var(--brand)', fontWeight: 600 }}>create a free account</Link>
                {' '}to save this appeal and track its status.
              </span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
