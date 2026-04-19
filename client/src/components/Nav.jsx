import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogoWordmark } from './Logo.jsx';

const ITEMS = [
  {
    to: '/', short: 'Check',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    label: 'Check denial',
  },
  {
    to: '/appeal', short: 'Appeal',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    label: 'Generate appeal',
  },
  {
    to: '/tracker', short: 'My Appeals',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    label: 'My appeals',
  },
];

function Avatar({ name }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <span style={{
      width: 32, height: 32, borderRadius: '50%',
      background: 'linear-gradient(135deg, #1A68B3, #39B54A)',
      color: '#fff', fontSize: '.75rem', fontWeight: 800,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {initials}
    </span>
  );
}

export default function Nav() {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Desktop top nav */}
      <nav className="topnav">
        <NavLink to="/" className="topnav-brand" end>
          <LogoWordmark iconSize={28} />
        </NavLink>

        <div className="topnav-links">
          {ITEMS.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) => isActive ? 'active' : ''}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="topnav-right">
          {user ? (
            <div className="user-menu">
              <Avatar name={user.name} />
              <span className="user-name">{user.name.split(' ')[0]}</span>
              <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6 }}>
              <Link className="btn btn-ghost btn-sm" to="/auth" state={{ tab: 'login' }}>
                Sign in
              </Link>
              <Link className="btn btn-primary btn-sm" to="/auth" state={{ tab: 'register' }}>
                Create account
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {ITEMS.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}>
            <span className="bottom-nav-icon">{item.icon}</span>
            <span>{item.short}</span>
          </NavLink>
        ))}
        {user ? (
          <button
            className="bottom-nav-item"
            onClick={logout}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <span className="bottom-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            <span>Sign out</span>
          </button>
        ) : (
          <Link className="bottom-nav-item" to="/auth" state={{ tab: 'login' }}>
            <span className="bottom-nav-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <span>Sign in</span>
          </Link>
        )}
      </nav>
    </>
  );
}
