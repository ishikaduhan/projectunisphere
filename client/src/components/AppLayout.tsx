import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/events', label: 'Events' },
    { to: '/clubs', label: 'Clubs' },
    { to: '/my-events', label: 'My Events' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/profile', label: 'Profile' },
    {
      to: '/organizer',
      label: 'Organizer',
      visible: user?.roles?.some((role) => role === 'organizer' || role === 'admin'),
    },
    {
      to: '/organizer/events',
      label: 'Manage events',
      visible: user?.roles?.some((role) => role === 'organizer' || role === 'admin'),
    },
    {
      to: '/admin',
      label: 'Admin',
      visible: user?.roles?.includes('admin'),
    },
    {
      to: '/admin/events',
      label: 'Admin events',
      visible: user?.roles?.includes('admin'),
    },
    {
      to: '/admin/clubs',
      label: 'Club management',
      visible: user?.roles?.includes('admin'),
    },
  ];

  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="app-body">
        <Sidebar links={navLinks} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
