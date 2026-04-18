import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';

const STATUSES = ['submitted','appealed','won','lost'];

export default function TrackerPage() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ axios.get('/api/tracker').then(r=>setAppeals(r.data)).finally(()=>setLoading(false)); },[]);

  async function updateStatus(id, status) {
    await axios.patch(`/api/tracker/${id}/status`, { status });
    setAppeals(a => a.map(ap => ap.id===id ? {...ap,status} : ap));
  }

  return (
    <div className="page">
      <nav className="nav">
        <NavLink to="/" className={({isActive})=>isActive?'active':''}>Check denial</NavLink>
        <NavLink to="/appeal" className={({isActive})=>isActive?'active':''}>Generate appeal</NavLink>
        <NavLink to="/tracker" className={({isActive})=>isActive?'active':''}>Track appeals</NavLink>
      </nav>
      <h1 className="page-title">Appeal tracker</h1>
      <p className="page-sub">Monitor the status of every appeal you've filed.</p>
      {loading && <p style={{color:'#666',fontSize:'.9rem'}}>Loading…</p>}
      {!loading && appeals.length===0 && (
        <div className="card" style={{textAlign:'center',color:'#888',fontSize:'.9rem',padding:'2rem'}}>
          No appeals tracked yet. Generate your first letter to get started.
        </div>
      )}
      {appeals.map(ap=>(
        <div className="card" key={ap.id}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{fontWeight:500,marginBottom:4}}>{ap.patientName} — CPT {ap.cptCode}</div>
              <div style={{fontSize:'.82rem',color:'#666'}}>{ap.insurerName} · Denied {ap.denialDate}</div>
            </div>
            <span className={`status-pill ${ap.status}`}>{ap.status}</span>
          </div>
          <div style={{marginTop:12}}>
            <label style={{marginTop:0}}>Update status</label>
            <select value={ap.status} onChange={e=>updateStatus(ap.id,e.target.value)} style={{marginTop:4}}>
              {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {ap.history && (
            <div style={{marginTop:8,fontSize:'.78rem',color:'#999'}}>
              {ap.history.map((h,i)=>(
                <span key={i}>{h.status} {new Date(h.date).toLocaleDateString()}{i<ap.history.length-1?' → ':''}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
