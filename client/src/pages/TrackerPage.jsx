import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

  const myAppeals = appeals.filter(a => !a.id.startsWith('seed_'));

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

          <div className="field" style={{ margin: 0 }}>
            <label>Update status</label>
            <select value={ap.status} onChange={e => updateStatus(ap.id, e.target.value)} style={{ marginTop: 5 }}>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
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
