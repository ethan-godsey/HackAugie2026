import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STATUSES = ['submitted', 'appealed', 'won', 'lost'];
const STATUS_LABEL = { submitted: 'Submitted', appealed: 'Appealed', won: 'Won', lost: 'Lost' };

function WinRateBadge({ rate }) {
  if (rate === null) return <span style={{ color: 'var(--text-3)', fontSize: '.78rem' }}>no outcomes yet</span>;
  const color = rate >= 60 ? 'var(--green)' : rate >= 40 ? 'var(--yellow)' : 'var(--red)';
  return <span style={{ fontWeight: 700, color }}>{rate}% win rate</span>;
}

export default function TrackerPage() {
  const navigate = useNavigate();
  const [tab, setTab]       = useState('leaderboard');
  const [appeals, setAppeals] = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/tracker'),
      axios.get('/api/tracker/stats'),
    ]).then(([appealsRes, statsRes]) => {
      setAppeals(appealsRes.data);
      setStats(statsRes.data);
    }).finally(() => setLoading(false));
  }, []);

  async function updateStatus(id, status) {
    await axios.patch(`/api/tracker/${id}/status`, { status });
    setAppeals(a => a.map(ap => ap.id === id ? { ...ap, status } : ap));
    const res = await axios.get('/api/tracker/stats');
    setStats(res.data);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Appeal tracker</h1>
        <p className="page-sub">Track your appeals and see which insurers deny the most claims.</p>
      </div>

      {/* Summary stats */}
      {stats && (
        <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { value: stats.total, label: 'Total appeals', color: 'var(--blue)' },
            { value: `${stats.winRate}%`, label: 'Win rate when filed', color: 'var(--green)' },
            { value: stats.won,   label: 'Appeals won', color: 'var(--green)' },
            { value: stats.leaderboard.length, label: 'Insurers tracked', color: 'var(--text-2)' },
          ].map(({ value, label, color }) => (
            <div key={label} style={{
              flex: '1', minWidth: 90,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '.85rem 1rem',
              textAlign: 'center', boxShadow: 'var(--shadow)',
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: '.73rem', color: 'var(--text-2)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.25rem', background: 'var(--bg)', borderRadius: 8, padding: 4, border: '1px solid var(--border)' }}>
        {[
          { id: 'leaderboard', label: '🏆 Insurer leaderboard' },
          { id: 'my',          label: '📋 My appeals' },
        ].map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '8px 12px', border: 'none', borderRadius: 6,
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

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: '.9rem' }}>
          <span className="spinner spinner-dark" /> Loading…
        </div>
      )}

      {/* Leaderboard */}
      {!loading && tab === 'leaderboard' && stats && (
        <>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1rem' }}>🏆</span>
              <span style={{ fontWeight: 600, fontSize: '.9rem' }}>Top denying insurers</span>
              <span style={{ marginLeft: 'auto', fontSize: '.75rem', color: 'var(--text-3)' }}>Based on {stats.total} appeals in database</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['Rank', 'Insurer', 'Denials', 'Won', 'Lost', 'Win rate'].map(h => (
                    <th key={h} style={{ padding: '8px 16px', textAlign: h === 'Insurer' ? 'left' : 'center', fontWeight: 600, fontSize: '.72rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.leaderboard.map((ins, i) => (
                  <tr key={ins.name} style={{ borderBottom: '1px solid var(--border)', transition: 'background .1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, color: i < 3 ? 'var(--blue)' : 'var(--text-3)' }}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 500 }}>{ins.name}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--red)' }}>{ins.denials}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center', color: 'var(--green)', fontWeight: 500 }}>{ins.won}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center', color: 'var(--red)',   fontWeight: 500 }}>{ins.lost}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center' }}><WinRateBadge rate={ins.winRate} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {stats.topCodes?.length > 0 && (
            <div className="card" style={{ marginTop: '.75rem' }}>
              <div className="card-title" style={{ marginBottom: '1rem' }}>
                <span className="card-title-icon">📊</span>
                Most frequently denied codes
              </div>
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                {stats.topCodes.map(({ code, count }) => (
                  <div key={code} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--blue-light)', border: '1px solid var(--blue-mid)',
                    borderRadius: 8, padding: '6px 14px',
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--blue)' }}>{code}</span>
                    <span style={{ fontSize: '.75rem', color: 'var(--text-2)' }}>{count} denial{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* My appeals */}
      {!loading && tab === 'my' && (
        <>
          {appeals.filter(a => !a.id.startsWith('seed_')).length === 0 && (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p style={{ fontWeight: 600, color: 'var(--text-2)', marginBottom: '.35rem' }}>No appeals tracked yet</p>
                <p>Generate your first letter to get started.</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/appeal')}>
                  Generate appeal letter →
                </button>
              </div>
            </div>
          )}
          {appeals.filter(a => !a.id.startsWith('seed_')).map(ap => (
            <div className="appeal-card" key={ap.id}>
              <div className="appeal-card-header">
                <div>
                  <div className="appeal-card-name">{ap.patientName || 'Unknown patient'}</div>
                  <div className="appeal-card-meta">
                    CPT {ap.cptCode} · {ap.insurerName}
                    {ap.denialDate && ` · Denied ${new Date(ap.denialDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </div>
                </div>
                <span className={`status-pill ${ap.status}`}>{STATUS_LABEL[ap.status]}</span>
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Update status</label>
                <select value={ap.status} onChange={e => updateStatus(ap.id, e.target.value)} style={{ marginTop: 5 }}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              {ap.history && ap.history.length > 1 && (
                <div className="appeal-history">
                  <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>History:</span>
                  {ap.history.map((h, i) => (
                    <span key={i}>
                      <span className={`status-pill ${h.status}`} style={{ fontSize: '.7rem', padding: '2px 8px' }}>
                        {STATUS_LABEL[h.status]}
                      </span>
                      {i < ap.history.length - 1 && <span style={{ color: 'var(--border2)' }}>→</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
