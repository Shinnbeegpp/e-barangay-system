import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

export default function Layout({ children, title, navItems }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="layout">
      {/* Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div style={{ fontSize: 28, marginBottom: 4 }}>🏛️</div>
          <h1>E-Barangay</h1>
          <p>Tinurik, Tanauan City</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((section, si) => (
            <div key={si}>
              {section.title && <div className="nav-section-title">{section.title}</div>}
              {section.items.map((item, ii) => (
                <button
                  key={ii}
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.first_name} {user?.last_name}</strong>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </div>
          <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="topbar-title">{title}</span>
        </header>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
