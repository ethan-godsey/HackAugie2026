import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

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

function downloadPDF(letter, name) {
  const escaped = letter.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Appeal Letter — ${name || 'Appeally'}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.7;color:#111;padding:1in;max-width:8.5in;margin:0 auto}
    pre{white-space:pre-wrap;font-family:inherit;font-size:inherit;line-height:inherit}
    .footer{margin-top:2em;padding-top:1em;border-top:1px solid #ccc;font-size:9pt;color:#666;text-align:center}
    .print-btn{position:fixed;top:16px;right:16px;background:#1A68B3;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:system-ui,sans-serif}
    .print-btn:hover{background:#145091}
    @media print{body{padding:0}@page{margin:0.85in;size:letter}.no-print{display:none}}
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Save as PDF</button>
  <pre>${escaped}</pre>
  <div class="footer">Generated by Appeally · Fight Denials. Win Your Rights.</div>
  <script>setTimeout(()=>window.print(),400);</script>
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

  const [letter, setLetter]   = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [error, setError]     = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true); setLetter(''); setError('');
    try {
      const { data } = await axios.post('/api/appeal/generate', form);
      setLetter(data.letter);
      setTimeout(() => document.getElementById('letter-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
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
        <h1 className="page-title">Generate appeal letter</h1>
        <p className="page-sub">Fill in your information below. We'll draft a formal letter citing the exact MHPAEA federal statute — ready to print and send.</p>
      </div>

      {fromCheck && (
        <div className="success-banner" style={{ marginBottom: '1rem' }}>
          <span>✓</span>
          Claim details pre-filled from your parity check — review and complete the form below.
        </div>
      )}

      <form onSubmit={handleGenerate}>

        {/* Section 1: Your personal info */}
        <div className="card">
          <div className="card-title">
            <span className="card-icon">👤</span>
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
            <span className="card-icon">📋</span>
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
            <span className="card-icon">🏥</span>
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
            <span className="card-icon">🩺</span>
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
        {error && <p className="error-msg">⚠ {error}</p>}
      </form>

      {/* Letter result */}
      {letter && (
        <div className="card" id="letter-result" style={{ marginTop: '1.5rem' }}>
          <div className="letter-header">
            <div className="card-title" style={{ margin: 0 }}>
              <span className="card-icon">📄</span>
              Your appeal letter
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-sm" onClick={handleCopy}>
                {copied ? '✓ Copied!' : 'Copy text'}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => downloadPDF(letter, form.patientName)}
              >
                ↓ Download PDF
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
        </div>
      )}
    </div>
  );
}
