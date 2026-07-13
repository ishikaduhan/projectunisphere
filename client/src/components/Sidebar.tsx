import { NavLink } from 'react-router-dom';

interface SidebarLink {
  to: string;
  label: string;
  visible?: boolean;
}

interface SidebarProps {
  links: SidebarLink[];
}

const Sidebar = ({ links }: SidebarProps) => (
  <aside className="sidebar" aria-label="Primary navigation">
    <nav className="sidebar-nav">
      {links.filter((link) => link.visible !== false).map((link) => (
        <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
