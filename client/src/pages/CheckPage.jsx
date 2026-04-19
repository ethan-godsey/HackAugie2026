import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { Search, ClipboardList, FileSearch, Scale, BookOpen, X, AlertTriangle, Check, Lock, AlertCircle, MessageSquare } from 'lucide-react';

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
    { code: '96156', label: '96156 — Health behavior assessment & intervention, 30 min' },
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
  { value: 'wrong_modifier',    label: 'Missing or incorrect modifier' },
  { value: 'out_of_network',    label: 'Provider out of network' },
  { value: 'timely_filing',     label: 'Timely filing limit exceeded' },
  { value: 'upcoding_flag',     label: 'Flagged for potential upcoding' },
  { value: 'coordination',      label: 'Coordination of benefits issue' },
];

const PLAN_TYPES = ['PPO','HMO','EPO','HDHP','Medicaid','Medicare Advantage','Marketplace ACA','Employer self-funded','TRICARE'];

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  background: '#fff',
  border: '1px solid var(--border-1)',
  borderRadius: 'var(--r-s)',
  padding: '4px 10px',
  fontSize: '.82rem',
  color: 'var(--text-1)',
  fontWeight: 500,
};

const VERDICT_META = {
  RED:    { icon: <X size={18} strokeWidth={3} />,              badge: 'Likely parity violation',   heading: 'Strong grounds to appeal under federal law' },
  YELLOW: { icon: <AlertTriangle size={18} strokeWidth={3} />,  badge: 'Possible parity violation', heading: 'This denial is worth challenging' },
  GREEN:  { icon: <Check size={18} strokeWidth={3} />,          badge: 'Administrative denial',     heading: 'File a standard appeal for this reason' },
};

export default function CheckPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab]               = useState('manual');
  const [denialText, setDenialText] = useState('');
  const [parsing, setParsing]       = useState(false);
  const [parsed, setParsed]         = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [parseError, setParseError] = useState('');
  const [form, setForm]             = useState({ cptCode: '', denialReason: '', planType: '' });
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleParse() {
    setParsing(true); setParseError(''); setParsed(false); setParsedData(null);
    try {
      const { data } = await axios.post('/api/parse', { text: denialText });
      setParsedData(data);
      setForm(f => ({
        ...f,
        cptCode:      data.cptCode      || f.cptCode,
        denialReason: data.denialReason || f.denialReason,
        planType:     f.planType,
      }));
      setParsed(true);
    } catch {
      setParseError('Could not parse — fill the fields manually below.');
      setTab('manual');
    } finally {
      setParsing(false);
    }
  }

  function handleContinueFromParse() {
    setTab('manual');
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

  const meta = result ? VERDICT_META[result.verdict] : null;

  return (
    <div className="page">

      {/* Hero */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-badge"><Scale size={13} /> MHPAEA Federal Parity Law</div>
          <h1>Your insurer denied your<br/><em>mental health claim.</em><br/>Fight back.</h1>
          <p>Over 70% of mental health denials violate federal law. Check yours in seconds — and generate a lawyer-quality appeal letter instantly.</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">70%</span>
              <span className="hero-stat-label">of MH denials are wrongful</span>
            </div>
            <div className="hero-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">73%</span>
              <span className="hero-stat-label">of appeals are overturned</span>
            </div>
            <div className="hero-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">&lt;1%</span>
              <span className="hero-stat-label">of patients ever appeal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="steps-row">
        {[
          { n: '1', title: 'Check your denial',  desc: 'Enter or paste your denial. We look up the federal statute.' },
          { n: '2', title: 'See your verdict',    desc: 'Instant RED / YELLOW / GREEN with the exact law citation.' },
          { n: '3', title: 'Generate & send',     desc: 'One click produces a formal appeal letter citing the statute.' },
        ].map(s => (
          <div className="step-card" key={s.n}>
            <div className="step-num">{s.n}</div>
            <div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Save prompt for guests */}
      {!user && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', marginBottom: '1rem',
          background: '#F8FAFF', border: '1px solid var(--border-2)',
          borderRadius: 'var(--r-s)', fontSize: '.82rem', color: 'var(--text-2)',
          flexWrap: 'wrap',
        }}>
          <Lock size={14} style={{ flexShrink: 0 }} />
          <span>
            <Link to="/auth" state={{ tab: 'login' }} style={{ color: 'var(--brand)', fontWeight: 600 }}>Sign in</Link>
            {' '}or{' '}
            <Link to="/auth" state={{ tab: 'register' }} style={{ color: 'var(--brand)', fontWeight: 600 }}>create a free account</Link>
            {' '}to save your appeal letters.
          </span>
        </div>
      )}

      {/* Check card */}
      <div className="card">
        <div className="card-title">
          <span className="card-icon"><Search size={16} /></span>
          Check your denial
        </div>

        <div className="tab-bar">
          <button className={`tab-btn${tab === 'manual' ? ' active' : ''}`} onClick={() => setTab('manual')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ClipboardList size={15} /> Enter manually
          </button>
          <button className={`tab-btn${tab === 'paste' ? ' active' : ''}`} onClick={() => setTab('paste')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FileSearch size={15} /> Paste denial letter
          </button>
        </div>

        {tab === 'paste' ? (
          <div>
            {!parsed ? (
              <>
                <div className="field">
                  <label>Your denial letter text</label>
                  <textarea
                    value={denialText}
                    onChange={e => setDenialText(e.target.value)}
                    placeholder="Paste the full text from your insurance denial letter here. We'll automatically extract the CPT code, denial reason, and other key details using AI…"
                    style={{ minHeight: 160 }}
                  />
                </div>
                <button
                  className="btn btn-primary btn-full"
                  onClick={handleParse}
                  disabled={parsing || denialText.trim().length < 20}
                >
                  {parsing
                    ? <><span className="spinner" /> Reading your letter with AI…</>
                    : 'Extract details from letter →'}
                </button>
                {parseError && <p className="error-msg"><AlertCircle size={14} style={{ flexShrink: 0 }} /> {parseError}</p>}
              </>
            ) : (
              <div>
                {/* Plain-English summary */}
                <div style={{
                  background: 'var(--brand-50)',
                  border: '1px solid var(--brand-light)',
                  borderRadius: 'var(--r-m)',
                  padding: '1rem 1.1rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '.55rem' }}>
                    <MessageSquare size={16} style={{ flexShrink: 0, color: 'var(--brand-dark)' }} />
                    <strong style={{ color: 'var(--brand-dark)', fontSize: '.9rem' }}>What this denial means for you</strong>
                  </div>
                  <p style={{ fontSize: '.9rem', color: 'var(--text-1)', lineHeight: 1.65, margin: 0 }}>
                    {parsedData?.summary || 'Your claim was denied. Review the extracted details below.'}
                  </p>
                </div>

                {/* Extracted fields chips */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.5rem' }}>
                    Details we extracted
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {parsedData?.cptCode && (
                      <div style={chipStyle}>
                        <span style={{ opacity: .6 }}>CPT</span> {parsedData.cptCode}
                      </div>
                    )}
                    {parsedData?.denialReason && (
                      <div style={chipStyle}>
                        <span style={{ opacity: .6 }}>Reason</span>{' '}
                        {DENIAL_REASONS.find(d => d.value === parsedData.denialReason)?.label || parsedData.denialReason}
                      </div>
                    )}
                    {parsedData?.insurerName && (
                      <div style={chipStyle}>
                        <span style={{ opacity: .6 }}>Insurer</span> {parsedData.insurerName}
                      </div>
                    )}
                    {parsedData?.denialDate && (
                      <div style={chipStyle}>
                        <span style={{ opacity: .6 }}>Date</span>{' '}
                        {new Date(parsedData.denialDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    {parsedData?.diagnosisCode && (
                      <div style={chipStyle}>
                        <span style={{ opacity: .6 }}>Dx</span> {parsedData.diagnosisCode}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className="btn"
                    style={{ flex: 1 }}
                    onClick={() => { setParsed(false); setParsedData(null); }}
                  >
                    ← Re-paste letter
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    onClick={handleContinueFromParse}
                  >
                    Looks right, continue →
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleCheck}>
            {parsed && (
              <div className="success-banner" style={{ marginBottom: '1rem' }}>
                <span>✓</span>
                Details extracted from your denial letter — review and confirm below, then check for a parity violation.
              </div>
            )}
            {parseError && (
              <div className="error-msg" style={{ marginBottom: '.85rem' }}><AlertCircle size={14} style={{ flexShrink: 0 }} /> {parseError}</div>
            )}

            <div className="field">
              <label>CPT code that was denied</label>
              <select value={form.cptCode} onChange={set('cptCode')} required>
                <option value="">Select a CPT code…</option>
                {CPT_GROUPS.map(g => (
                  <optgroup key={g.label} label={g.label}>
                    {g.codes.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Reason given for denial</label>
              <select value={form.denialReason} onChange={set('denialReason')} required>
                <option value="">Select a reason…</option>
                {DENIAL_REASONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
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
            {error && <p className="error-msg"><AlertCircle size={14} style={{ flexShrink: 0 }} /> {error}</p>}
          </form>
        )}
      </div>

      {/* Verdict */}
      {result && meta && (
        <div className={`verdict ${result.verdict}`}>
          <div className="verdict-top">
            <div className="verdict-icon-wrap">{meta.icon}</div>
            <div>
              <div className="verdict-badge">{meta.badge}</div>
              <div className="verdict-heading">{meta.heading}</div>
            </div>
          </div>

          <div className="verdict-body-area">
            <p className="verdict-explanation">{result.explanation}</p>

            {result.cptInfo && (
              <div className="verdict-equivalent">
                <Scale size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  <strong>Comparable medical service your plan covers:</strong>{' '}
                  {result.cptInfo.medicalEquivalentName} (CPT {result.cptInfo.medicalEquivalent}).
                  Your insurer cannot apply stricter rules to mental health care than to equivalent physical health care.
                </span>
              </div>
            )}

            {result.statute && (
              <div className="statute-chip">
                <BookOpen size={13} />
                <span>{result.statute}</span>
              </div>
            )}

            {result.verdict !== 'GREEN' && (
              <>
                <div className="divider" />
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => navigate('/appeal', { state: { ...form, ...result } })}
                >
                  Generate appeal letter →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
