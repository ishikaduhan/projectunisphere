import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>UniSphere</h1>
          <p>Welcome back{user?.roles ? ` (${user.roles.join(', ')})` : ''}</p>
        </div>
        <button type="button" className="button button-secondary" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="app-body">
        <nav className="app-nav" aria-label="Primary navigation">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/clubs">Clubs</NavLink>
          <NavLink to="/my-events">My Events</NavLink>
          <NavLink to="/notifications">Notifications</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
