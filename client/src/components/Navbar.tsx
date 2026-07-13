import { Link } from 'react-router-dom';

interface NavbarProps {
  user?: {
    roles?: string[];
  } | null;
  onLogout: () => void;
}

const Navbar = ({ user, onLogout }: NavbarProps) => (
  <header className="app-header">
    <div className="topbar-brand">
      <Link to="/" className="brand-link">
        <span className="brand-mark">UniSphere</span>
      </Link>
      <p className="brand-tag">Campus events, registrations and admin tools in one place.</p>
    </div>

    <div className="topbar-actions">
      {user?.roles && <span className="role-chip">{user.roles.join(', ')}</span>}
      <button type="button" className="button button-secondary" onClick={onLogout}>
        Sign Out
      </button>
    </div>
  </header>
);

export default Navbar;
