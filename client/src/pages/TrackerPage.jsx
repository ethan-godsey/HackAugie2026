import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  const body     = renderLetterHtml(letter);
  const safeName = (name || 'Appeally').replace(/</g,'&lt;');
  const insurer  = lookupInsurer(insurerName);
  const addrHtml = insurer
    ? insurer.addr.replace(/\n/g, '<br>')
    : `${(insurerName || 'Your Insurance Company').replace(/</g,'&lt;')}<br><em>Check your Explanation of Benefits (EOB) or call the member services number on your insurance card for the correct appeals mailing address.</em>`;

  const instructionsPage = `
  <div class="page-break"></div>
  <div class="instructions-page">
    <div class="inst-header">
      <div class="inst-logo">Appeally</div>
      <div class="inst-title">How to Send Your Appeal</div>
      <div class="inst-sub">Follow these steps carefully to ensure your appeal is received and processed on time.</div>
    </div>
    <div class="step-list">
      <div class="step"><div class="step-num">1</div><div class="step-body"><strong>Print the appeal letter</strong><p>Print the letter on standard 8.5" × 11" white paper. Sign your name where indicated before mailing.</p></div></div>
      <div class="step"><div class="step-num">2</div><div class="step-body"><strong>Gather your enclosures</strong><p>Include copies (not originals) of: your Explanation of Benefits (EOB), any supporting documentation from your treating provider, and prior authorization records if applicable.</p></div></div>
      <div class="step"><div class="step-num">3</div><div class="step-body"><strong>Mail via Certified Mail with Return Receipt</strong><p>At your post office, request <strong>USPS Certified Mail</strong> with <strong>Return Receipt (Form 3811)</strong>. Keep the tracking number and the green receipt card — this is your legal proof of delivery.</p></div></div>
      <div class="step"><div class="step-num">4</div><div class="step-body"><strong>Send to the insurer's appeals department</strong><div class="addr-box">${addrHtml}</div></div></div>
      <div class="step"><div class="step-num">5</div><div class="step-body"><strong>Keep a complete copy for your records</strong><p>File a copy of the signed letter, all enclosures, and your certified mail receipt. If your appeal is denied again, this packet is your evidence for escalation.</p></div></div>
      <div class="step"><div class="step-num">6</div><div class="step-body"><strong>If no response within 30 days</strong><p>File a complaint with the <strong>U.S. Department of Labor EBSA</strong> at <strong>dol.gov/EBSA</strong> or call 1-866-444-3272. Also file with your <strong>State Insurance Commissioner</strong>.</p></div></div>
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
    .page-break{page-break-before:always;break-before:page}
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
    .inst-footer{margin-top:2rem;padding-top:.75rem;border-top:1px solid #ddd;font-size:.72rem;color:#999;text-align:center;font-family:Arial,sans-serif}
    @media print{.no-print{display:none}@page{margin:1in;size:letter}.page-break{page-break-before:always;break-before:page;height:0}.instructions-page{padding-top:.5in}}
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Save as PDF</button>
  <div class="letter-body">${body}</div>
  <div class="footer">Prepared by Appeally &middot; Fight Denials. Win Your Rights.</div>
  ${instructionsPage}
  <script>setTimeout(()=>window.print(),400);</script>
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  win?.addEventListener('unload', () => URL.revokeObjectURL(url));
}

const STATUSES = ['submitted', 'appealed', 'won', 'lost'];
const STATUS_LABEL = { submitted: 'Submitted', appealed: 'Appealed', won: 'Won', lost: 'Lost' };

export default function TrackerPage() {
  const navigate = useNavigate();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/tracker')
      .then(r => setAppeals(r.data))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(id, status) {
    await axios.patch(`/api/tracker/${id}/status`, { status });
    setAppeals(a => a.map(ap => ap.id === id ? { ...ap, status } : ap));
  }

  const myAppeals = appeals;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My appeals</h1>
        <p className="page-sub">Track the status of every appeal you've filed.</p>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: '.9rem', padding: '1rem 0' }}>
          <span className="spinner spinner-dark" /> Loading…
        </div>
      )}

      {!loading && myAppeals.length === 0 && (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">📋</div>
            <div className="empty-title">No appeals tracked yet</div>
            <div className="empty-sub">Generate your first letter to get started.</div>
            <button className="btn btn-primary" style={{ marginTop: '1.1rem' }} onClick={() => navigate('/appeal')}>
              Generate appeal letter →
            </button>
          </div>
        </div>
      )}

      {!loading && myAppeals.map(ap => (
        <div className="appeal-card" key={ap.id}>
          <div className="appeal-card-head">
            <div>
              <div className="appeal-card-name">{ap.patientName || 'Unknown patient'}</div>
              <div className="appeal-card-meta">
                CPT {ap.cptCode}
                {ap.insurerName && ` · ${ap.insurerName}`}
                {ap.denialDate && ` · Denied ${new Date(ap.denialDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </div>
            </div>
            <span className={`pill pill-${ap.status}`}>{STATUS_LABEL[ap.status]}</span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="field" style={{ margin: 0, flex: 1, minWidth: 160 }}>
              <label>Update status</label>
              <select value={ap.status} onChange={e => updateStatus(ap.id, e.target.value)} style={{ marginTop: 5 }}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            {ap.letter && (
              <button
                className="btn btn-primary btn-sm"
                style={{ flexShrink: 0 }}
                onClick={() => downloadPDF(ap.letter, ap.patientName, ap.insurerName)}
              >
                ↓ Download letter
              </button>
            )}
          </div>

          {ap.history?.length > 1 && (
            <div className="history-row">
              <span>History:</span>
              {ap.history.map((h, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className={`pill pill-${h.status}`} style={{ fontSize: '.68rem', padding: '2px 8px' }}>
                    {STATUS_LABEL[h.status]}
                  </span>
                  {i < ap.history.length - 1 && <span style={{ color: 'var(--border-2)' }}>→</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
