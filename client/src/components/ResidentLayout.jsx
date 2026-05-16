import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LayoutDashboard, User, FileText, Heart, AlertTriangle, Clock, Settings, LogOut } from 'lucide-react';
import LogoutConfirm from './LogoutConfirm';

const navItems = [
  { to: '/resident/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { to: '/resident/profile', icon: <User size={16} />, label: 'Profile & Verification' },
  { to: '/resident/documents', icon: <FileText size={16} />, label: 'Document Requests' },
  { to: '/resident/assistance', icon: <Heart size={16} />, label: 'Assistance Portal' },
  { to: '/resident/incidents', icon: <AlertTriangle size={16} />, label: 'Incident Report' },
  { to: '/resident/tracker', icon: <Clock size={16} />, label: 'My Tracker' },
  { to: '/resident/settings', icon: <Settings size={16} />, label: 'Account Settings' },
];

export default function ResidentLayout() {
  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const handleLogoutClick = () => setShowLogout(true);

  return (
    <div className="layout">
      {showLogout && <LogoutConfirm onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h1>🏛️ E-Barangay System<br /></h1>
          <p>Resident Portal</p>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-title">Menu</div>
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>
              {icon} {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.first_name} {user?.last_name}</strong>
            Resident
          </div>
          <button className="btn-logout" onClick={handleLogoutClick}><LogOut size={14} style={{ display: 'inline', marginRight: 6 }} />Sign Out</button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="topbar-title">E-Barangay System</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Resident Portal</span>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
