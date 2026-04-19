import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogoWordmark } from './Logo.jsx';
import { Search, FileText, ClipboardList, LogOut, UserCircle } from 'lucide-react';

const ITEMS = [
  { to: '/',        short: 'Check',      icon: <Search size={20} />,        label: 'Check denial' },
  { to: '/appeal',  short: 'Appeal',     icon: <FileText size={20} />,      label: 'Generate appeal' },
  { to: '/tracker', short: 'My Appeals', icon: <ClipboardList size={20} />, label: 'My appeals' },
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
            <span className="bottom-nav-icon"><LogOut size={20} /></span>
            <span>Sign out</span>
          </button>
        ) : (
          <Link className="bottom-nav-item" to="/auth" state={{ tab: 'login' }}>
            <span className="bottom-nav-icon"><UserCircle size={20} /></span>
            <span>Sign in</span>
          </Link>
        )}
      </nav>
    </>
  );
}
