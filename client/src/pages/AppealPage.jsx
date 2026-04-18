import { useState } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AppealPage() {
  const { state: pre = {} } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patientName:'', insurerName:'', planId:'', denialDate:'',
    therapistName:'', diagnosisCode:'',
    cptCode: pre.cptCode||'', denialReason: pre.denialReason||'', planType: pre.planType||''
  });
  const [letter, setLetter]   = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved]     = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  async function handleGenerate(e) {
    e.preventDefault(); setLoading(true); setLetter('');
    try {
      const { data } = await axios.post('/api/appeal/generate', form);
      setLetter(data.letter);
    } catch { setLetter('Error generating. Check ANTHROPIC_API_KEY in server/.env'); }
    finally { setLoading(false); }
  }

  async function saveToTracker() {
    await axios.post('/api/tracker', { ...form, letter });
    setSaved(true);
    setTimeout(()=>navigate('/tracker'), 1000);
  }

  return (
    <div className="page">
      <nav className="nav">
        <NavLink to="/" className={({isActive})=>isActive?'active':''}>Check denial</NavLink>
        <NavLink to="/appeal" className={({isActive})=>isActive?'active':''}>Generate appeal</NavLink>
        <NavLink to="/tracker" className={({isActive})=>isActive?'active':''}>Track appeals</NavLink>
      </nav>
      <h1 className="page-title">Generate appeal letter</h1>
      <p className="page-sub">We'll draft a formal letter citing the exact MHPAEA statute for your denial.</p>
      <div className="card">
        <form onSubmit={handleGenerate}>
          <div className="row">
            <div><label>Your full name</label><input value={form.patientName} onChange={set('patientName')} placeholder="Jane Smith" required/></div>
            <div><label>Insurance company</label><input value={form.insurerName} onChange={set('insurerName')} placeholder="UnitedHealthcare" required/></div>
          </div>
          <div className="row">
            <div><label>Plan / member ID</label><input value={form.planId} onChange={set('planId')} placeholder="XYZ123456" required/></div>
            <div><label>Denial date</label><input type="date" value={form.denialDate} onChange={set('denialDate')} required/></div>
          </div>
          <div className="row">
            <div><label>Therapist name (optional)</label><input value={form.therapistName} onChange={set('therapistName')} placeholder="Dr. Sarah Lee"/></div>
            <div><label>Diagnosis code ICD-10 (optional)</label><input value={form.diagnosisCode} onChange={set('diagnosisCode')} placeholder="F32.1"/></div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <><span className="spinner"/> Generating with AI…</> : 'Generate appeal letter'}
          </button>
        </form>
      </div>
      {letter && (
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <strong style={{fontSize:'.9rem'}}>Your appeal letter</strong>
            <div style={{display:'flex',gap:8}}>
              <button className="btn" style={{fontSize:'.8rem',padding:'6px 14px'}} onClick={()=>navigator.clipboard.writeText(letter)}>Copy</button>
              <button className="btn btn-primary" style={{fontSize:'.8rem',padding:'6px 14px'}} onClick={saveToTracker}>
                {saved ? 'Saved!' : 'Save & track →'}
              </button>
            </div>
          </div>
          <div className="letter-box">{letter}</div>
        </div>
      )}
    </div>
  );
}
