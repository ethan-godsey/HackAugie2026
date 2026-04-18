import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    { code: '99212', label: '99212 — Established patient visit, low complexity (10 min)' },
    { code: '99213', label: '99213 — Established patient visit, moderate complexity (15 min)' },
    { code: '99214', label: '99214 — Established patient visit, mod-high complexity (25 min)' },
    { code: '99215', label: '99215 — Established patient visit, high complexity (40 min)' },
  ]},
  { label: 'Psychological Testing', codes: [
    { code: '96130', label: '96130 — Psychological testing evaluation, first hour' },
    { code: '96131', label: '96131 — Psychological testing evaluation, each additional hour' },
    { code: '96136', label: '96136 — Neuropsychological test administration, first 30 min' },
  ]},
  { label: 'Collaborative Care', codes: [
    { code: '99484', label: '99484 — General behavioral health integration, 20+ min/month' },
    { code: '99492', label: '99492 — Psychiatric collaborative care, initial 70 min' },
    { code: '99493', label: '99493 — Psychiatric collaborative care, subsequent 60 min' },
  ]},
  { label: 'Health Behavior', codes: [
    { code: '96156', label: '96156 — Health behavior assessment and intervention, 30 min' },
    { code: '96158', label: '96158 — Health behavior intervention, individual, 30 min' },
  ]},
  { label: 'Telehealth', codes: [
    { code: 'G0459', label: 'G0459 — Telehealth pharmacologic management, 20+ min' },
    { code: 'G2012', label: 'G2012 — Brief virtual check-in, 5–10 min' },
  ]},
  { label: 'Substance Use Disorder', codes: [
    { code: 'H0004', label: 'H0004 — BH counseling and therapy, per 15 min (SUD)' },
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
  { value: 'wrong_modifier',    label: 'Missing or incorrect modifier (e.g. -95 for telehealth)' },
  { value: 'out_of_network',    label: 'Provider out of network' },
  { value: 'timely_filing',     label: 'Timely filing limit exceeded' },
  { value: 'upcoding_flag',     label: 'Flagged for potential upcoding' },
  { value: 'coordination',      label: 'Coordination of benefits issue' },
];

const PLAN_TYPES = [
  'PPO', 'HMO', 'EPO', 'HDHP',
  'Medicaid', 'Medicare Advantage', 'Marketplace ACA',
  'Employer self-funded', 'TRICARE',
];

const VERDICT_META = {
  RED:    { icon: '✕', label: 'Likely parity violation',   sub: 'Strong grounds to appeal under federal law' },
  YELLOW: { icon: '!', label: 'Possible parity violation', sub: 'Appeal is worth filing — further review needed' },
  GREEN:  { icon: '✓', label: 'Administrative denial',     sub: 'File a standard appeal addressing the specific reason' },
};

export default function CheckPage() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState('manual'); // 'manual' | 'paste'
  const [denialText, setDenialText] = useState('');
  const [parsing, setParsing]   = useState(false);
  const [parseError, setParseError] = useState('');
  const [parsed, setParsed]     = useState(false);

  const [form, setForm]       = useState({ cptCode: '', denialReason: '', planType: '' });
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleParse() {
    setParsing(true); setParseError(''); setParsed(false);
    try {
      const { data } = await axios.post('/api/parse', { text: denialText });
      setForm(f => ({
        ...f,
        cptCode:      data.cptCode      || f.cptCode,
        denialReason: data.denialReason || f.denialReason,
      }));
      setParsed(true);
      setTab('manual');
    } catch {
      setParseError('Could not parse letter. Fill the fields manually below.');
      setTab('manual');
    } finally {
      setParsing(false);
    }
  }

  async function handleCheck(e) {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await axios.post('/api/check', form);
      setResult(data);
    } catch {
      setError('Could not reach the server. Make sure the backend is running on port 3001.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">⚖ MHPAEA Parity Checker</div>
        <h1>Was your mental health claim denied unfairly?</h1>
        <p>Over 70% of mental health denials violate federal parity law — and 73% of appeals that get filed are overturned. Check yours in seconds.</p>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
          {[
            { stat: '70%', label: 'of MH denials are wrongful' },
            { stat: '73%', label: 'of appeals are overturned' },
            { stat: '<1%', label: 'of patients ever appeal' },
          ].map(({ stat, label }) => (
            <div key={stat} style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>{stat}</span>
              <span style={{ fontSize: '.75rem', opacity: .75, marginTop: 3 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem' }}>
        {[
          { n: '1', title: 'Check your denial', desc: 'Enter your CPT code and denial reason — or paste the letter.' },
          { n: '2', title: 'See your verdict',  desc: 'Instant RED/YELLOW/GREEN with the exact federal statute.' },
          { n: '3', title: 'Generate & send',   desc: 'One click produces a lawyer-quality appeal letter.' },
        ].map(({ n, title, desc }) => (
          <div key={n} style={{
            flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '.9rem 1rem', boxShadow: 'var(--shadow)',
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', background: 'var(--blue)',
              color: '#fff', fontSize: '.75rem', fontWeight: 700, display: 'flex',
              alignItems: 'center', justifyContent: 'center', marginBottom: '.5rem',
            }}>{n}</div>
            <div style={{ fontWeight: 600, fontSize: '.85rem', marginBottom: 2 }}>{title}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--text-2)', lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Check card */}
      <div className="card">
        {/* Tab toggle */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '1.25rem', background: 'var(--bg)', borderRadius: 8, padding: 4 }}>
          {[
            { id: 'manual', label: '📋 Enter manually' },
            { id: 'paste',  label: '📄 Paste denial letter' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '7px 12px', border: 'none', borderRadius: 6,
                fontSize: '.83rem', fontWeight: 600, cursor: 'pointer',
                background: tab === t.id ? 'var(--surface)' : 'transparent',
                color: tab === t.id ? 'var(--text)' : 'var(--text-2)',
                boxShadow: tab === t.id ? 'var(--shadow)' : 'none',
                transition: 'all .15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'paste' ? (
          <div>
            <div className="field">
              <label>Paste your denial letter</label>
              <textarea
                value={denialText}
                onChange={e => setDenialText(e.target.value)}
                placeholder="Paste the full text of your insurance denial letter here. We'll automatically extract the CPT code, denial reason, and insurer details…"
                style={{ minHeight: 160 }}
              />
            </div>
            <button
              className="btn btn-primary btn-full"
              onClick={handleParse}
              disabled={parsing || denialText.trim().length < 20}
            >
              {parsing ? <><span className="spinner" /> Analyzing letter…</> : 'Extract details from letter →'}
            </button>
            {parseError && <p className="error-msg">⚠ {parseError}</p>}
          </div>
        ) : (
          <form onSubmit={handleCheck}>
            {parsed && (
              <div style={{
                background: 'var(--green-light)', border: '1px solid var(--green-border)',
                borderRadius: 'var(--radius-s)', padding: '9px 14px', fontSize: '.82rem',
                color: 'var(--green)', marginBottom: '1rem', display: 'flex', gap: 6, alignItems: 'center',
              }}>
                ✓ Details extracted from your denial letter — review and confirm below.
              </div>
            )}
            <div className="field">
              <label>CPT code that was denied</label>
              <select value={form.cptCode} onChange={set('cptCode')} required>
                <option value="">Select a CPT code…</option>
                {CPT_GROUPS.map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.codes.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Reason given for denial</label>
              <select value={form.denialReason} onChange={set('denialReason')} required>
                <option value="">Select a reason…</option>
                {DENIAL_REASONS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Your insurance plan type</label>
              <select value={form.planType} onChange={set('planType')} required>
                <option value="">Select plan type…</option>
                {PLAN_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <><span className="spinner" /> Analyzing…</> : 'Check for parity violation →'}
            </button>
            {error && <p className="error-msg">⚠ {error}</p>}
          </form>
        )}
      </div>

      {/* Verdict */}
      {result && (() => {
        const meta = VERDICT_META[result.verdict];
        return (
          <div className={`verdict ${result.verdict}`}>
            <div className="verdict-header">
              <div className="verdict-icon">{meta.icon}</div>
              <div>
                <div className="verdict-label">{meta.label}</div>
                <div className="verdict-title">{meta.sub}</div>
              </div>
            </div>
            <div className="verdict-divider" />
            <p className="verdict-body">{result.explanation}</p>
            {result.cptInfo && (
              <p className="verdict-body" style={{ marginTop: '.5rem' }}>
                <strong>Comparable medical service:</strong> {result.cptInfo.medicalEquivalentName} (CPT {result.cptInfo.medicalEquivalent}) — which your plan likely covers without the same restrictions.
              </p>
            )}
            {result.statute && (
              <div className="statute-pill" style={{ marginTop: '.85rem' }}>📋 {result.statute}</div>
            )}
            {result.verdict !== 'GREEN' && (
              <>
                <div className="verdict-divider" />
                <button
                  className="btn btn-primary btn-full"
                  onClick={() => navigate('/appeal', { state: { ...form, ...result } })}
                >
                  Generate appeal letter →
                </button>
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
}
