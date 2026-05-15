import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Menu, X, LayoutDashboard, UserCheck, FileText, Heart, AlertTriangle, Megaphone, Users, ShieldCheck, ScrollText, Settings, LogOut } from 'lucide-react';

export default function StaffLayout() {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchStats = () => {
  api.get('/staff/dashboard-stats').then(r => setStats(r.data)).catch(() => {});
};

useEffect(() => {
  fetchStats();
  const interval = setInterval(fetchStats, 15000);
  return () => clearInterval(interval);
}, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/staff/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
    { to: '/staff/verification', icon: <UserCheck size={16} />, label: 'Account Verification', badge: stats.pendingVerifications },
    { to: '/staff/documents', icon: <FileText size={16} />, label: 'Document Requests', badge: stats.pendingDocuments },
    { to: '/staff/assistance', icon: <Heart size={16} />, label: 'Assistance Programs', badge: stats.pendingAssistance },
    { to: '/staff/reports', icon: <AlertTriangle size={16} />, label: 'Citizen Reports', badge: stats.pendingReports },
    { to: '/staff/announcements', icon: <Megaphone size={16} />, label: 'Announcements' },
    { to: '/staff/residents', icon: <Users size={16} />, label: 'Resident Records' },
    ...(user?.role === 'admin' ? [{ to: '/staff/accounts', icon: <ShieldCheck size={16} />, label: 'Admin Accounts' }] : []),
    { to: '/staff/logs', icon: <ScrollText size={16} />, label: 'Transaction Logs' },
    { to: '/staff/settings', icon: <Settings size={16} />, label: 'Account Settings' },
  ];

  return (
    <div className="layout">
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h1>🏛️ E-Barangay<br />Tinurik</h1>
          <p>{user?.role === 'admin' ? 'Admin Portal' : 'Staff Portal'}</p>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-title">Management</div>
          {navItems.map(({ to, icon, label, badge }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>
              {icon} {label}
              {badge > 0 && <span className="nav-badge">{badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.first_name} {user?.last_name}</strong>
            {user?.role === 'admin' ? 'Administrator' : 'Staff'}
          </div>
          <button className="btn-logout" onClick={handleLogout}><LogOut size={14} style={{ display: 'inline', marginRight: 6 }} />Sign Out</button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="topbar-title">E-Barangay Tinurik</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.role === 'admin' ? 'Admin' : 'Staff'} Portal</span>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
