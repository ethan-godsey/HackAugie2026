import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AppealPage() {
  const { state: pre = {} } = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patientName:   '',
    insurerName:   '',
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
  const [saved, setSaved]     = useState(false);
  const [copied, setCopied]   = useState(false);
  const [error, setError]     = useState('');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true); setLetter(''); setError('');
    try {
      const { data } = await axios.post('/api/appeal/generate', form);
      setLetter(data.letter);
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

  async function handleSave() {
    await axios.post('/api/tracker', { ...form, letter });
    setSaved(true);
    setTimeout(() => navigate('/tracker'), 900);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Generate appeal letter</h1>
        <p className="page-sub">We'll draft a formal letter citing the exact MHPAEA statute for your denial.</p>
      </div>

      <div className="card">
        <div className="card-title">
          <span className="card-title-icon">📝</span>
          Your information
        </div>
        <form onSubmit={handleGenerate}>
          <div className="row">
            <div className="field">
              <label>Your full name</label>
              <input value={form.patientName} onChange={set('patientName')} placeholder="Jane Smith" required />
            </div>
            <div className="field">
              <label>Insurance company</label>
              <input value={form.insurerName} onChange={set('insurerName')} placeholder="UnitedHealthcare" required />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Plan / member ID</label>
              <input value={form.planId} onChange={set('planId')} placeholder="XYZ123456" required />
            </div>
            <div className="field">
              <label>Denial date</label>
              <input type="date" value={form.denialDate} onChange={set('denialDate')} required />
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Therapist name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input value={form.therapistName} onChange={set('therapistName')} placeholder="Dr. Sarah Lee" />
            </div>
            <div className="field">
              <label>Diagnosis code ICD-10 <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input value={form.diagnosisCode} onChange={set('diagnosisCode')} placeholder="F32.1" />
            </div>
          </div>

          {pre.cptCode && (
            <div style={{
              background: 'var(--blue-light)',
              border: '1px solid var(--blue-mid)',
              borderRadius: 'var(--radius-s)',
              padding: '10px 14px',
              fontSize: '.82rem',
              color: 'var(--blue)',
              marginTop: '.75rem',
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}>
              ℹ Pre-filled from your parity check: CPT {pre.cptCode} · {pre.denialReason?.replace(/_/g, ' ')} · {pre.planType}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading
              ? <><span className="spinner" /> Generating with AI…</>
              : 'Generate appeal letter →'}
          </button>
          {error && <p className="error-msg">⚠ {error}</p>}
        </form>
      </div>

      {letter && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
            <div className="card-title" style={{ margin: 0 }}>
              <span className="card-title-icon">📄</span>
              Your appeal letter
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" onClick={handleCopy}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saved}>
                {saved ? '✓ Saved!' : 'Save & track →'}
              </button>
            </div>
          </div>
          <div className="letter-box">{letter}</div>
        </div>
      )}
    </div>
  );
}
