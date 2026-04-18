import { NavLink } from 'react-router-dom';

export default function Nav() {
  return (
    <nav className="topnav">
      <NavLink to="/" className="topnav-brand">
        <span className="topnav-brand-icon">PC</span>
        ParityCheck
      </NavLink>
      <div className="topnav-links">
        <NavLink to="/"        className={({ isActive }) => isActive ? 'active' : ''}>Check denial</NavLink>
        <NavLink to="/appeal"  className={({ isActive }) => isActive ? 'active' : ''}>Generate appeal</NavLink>
        <NavLink to="/tracker" className={({ isActive }) => isActive ? 'active' : ''}>Track appeals</NavLink>
      </div>
    </nav>
  );
}
