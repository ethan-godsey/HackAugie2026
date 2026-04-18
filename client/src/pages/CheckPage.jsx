import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import axios from 'axios';

const CPT_CODES = [
  { code:'90837', label:'90837 — Individual therapy, 60 min' },
  { code:'90834', label:'90834 — Individual therapy, 45 min' },
  { code:'90832', label:'90832 — Individual therapy, 30 min' },
  { code:'90847', label:'90847 — Family therapy with patient' },
  { code:'90853', label:'90853 — Group psychotherapy' },
  { code:'90792', label:'90792 — Psychiatric diagnostic evaluation' },
];

const DENIAL_REASONS = [
  { value:'medical_necessity', label:'Not medically necessary' },
  { value:'visit_cap',         label:'Visit limit exceeded' },
  { value:'prior_auth',        label:'Prior authorization required / missing' },
  { value:'documentation',     label:'Insufficient documentation' },
  { value:'not_covered',       label:'Service not covered under plan' },
  { value:'wrong_cpt',         label:'Incorrect CPT code / mismatch' },
  { value:'out_of_network',    label:'Provider out of network' },
];

const PLAN_TYPES = ['PPO','HMO','EPO','HDHP','Medicaid','Medicare Advantage','Marketplace ACA'];

const VERDICT_META = {
  RED:    { label:'Parity violation detected', sub:'Strong grounds to appeal' },
  YELLOW: { label:'Possible parity violation', sub:'Appeal is worth filing' },
  GREEN:  { label:'Administrative denial',     sub:'File a standard appeal' },
};

export default function CheckPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ cptCode:'', denialReason:'', planType:'' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleCheck(e) {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await axios.post('/api/check', form);
      setResult(data);
    } catch { setError('Server error. Make sure the backend is running.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="page">
      <nav className="nav">
        <NavLink to="/" className={({isActive})=>isActive?'active':''}>Check denial</NavLink>
        <NavLink to="/appeal" className={({isActive})=>isActive?'active':''}>Generate appeal</NavLink>
        <NavLink to="/tracker" className={({isActive})=>isActive?'active':''}>Track appeals</NavLink>
      </nav>
      <h1 className="page-title">ParityCheck</h1>
      <p className="page-sub">Find out if your mental health claim denial violates federal parity law — and generate an appeal letter in seconds.</p>
      <div className="card">
        <form onSubmit={handleCheck}>
          <label>Therapy CPT code that was denied</label>
          <select value={form.cptCode} onChange={set('cptCode')} required>
            <option value="">Select a code…</option>
            {CPT_CODES.map(c=><option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
          <label>Reason given for denial</label>
          <select value={form.denialReason} onChange={set('denialReason')} required>
            <option value="">Select a reason…</option>
            {DENIAL_REASONS.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <label>Your insurance plan type</label>
          <select value={form.planType} onChange={set('planType')} required>
            <option value="">Select plan type…</option>
            {PLAN_TYPES.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner"/> : 'Check for parity violation'}
          </button>
        </form>
        {error && <p style={{color:'red',marginTop:'1rem',fontSize:'.85rem'}}>{error}</p>}
      </div>
      {result && (
        <div className={`verdict ${result.verdict}`}>
          <div className="verdict-label">{VERDICT_META[result.verdict].label}</div>
          <div className="verdict-title">{VERDICT_META[result.verdict].sub}</div>
          <div className="verdict-body">{result.explanation}</div>
          {result.statute && <div className="statute-pill">{result.statute}</div>}
          {result.verdict !== 'GREEN' && (
            <button className="btn btn-primary btn-full" style={{marginTop:'1rem'}}
              onClick={()=>navigate('/appeal',{state:{...form,...result}})}>
              Generate appeal letter →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
