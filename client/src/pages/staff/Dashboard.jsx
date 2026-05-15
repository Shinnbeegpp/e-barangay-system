import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { UserCheck, FileText, Heart, AlertTriangle, Megaphone, Users, ShieldCheck, ScrollText } from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ pendingVerifications: 0, pendingDocuments: 0, pendingAssistance: 0, pendingReports: 0 });

  useEffect(() => {
  const fetchStats = () => {
    api.get('/staff/dashboard-stats').then(r => setStats(r.data)).catch(() => {});
  };
  fetchStats();
  const interval = setInterval(fetchStats, 15000);
  return () => clearInterval(interval);
}, []);

  const statCards = [
    { label: 'Pending Verifications', value: stats.pendingVerifications, icon: '👤', color: '#dbeafe', to: '/staff/verification' },
    { label: 'Pending Documents', value: stats.pendingDocuments, icon: '📄', color: '#d1fae5', to: '/staff/documents' },
    { label: 'Pending Assistance', value: stats.pendingAssistance, icon: '❤️', color: '#fce7f3', to: '/staff/assistance' },
    { label: 'Pending Reports', value: stats.pendingReports, icon: '⚠️', color: '#fef3c7', to: '/staff/reports' },
  ];

  const quickCards = [
    { label: 'Account Verification', icon: '✅', color: '#dbeafe', to: '/staff/verification' },
    { label: 'Document Requests', icon: '📄', color: '#d1fae5', to: '/staff/documents' },
    { label: 'Assistance Programs', icon: '❤️', color: '#fce7f3', to: '/staff/assistance' },
    { label: 'Citizen Reports', icon: '⚠️', color: '#fef3c7', to: '/staff/reports' },
    { label: 'Announcements', icon: '📢', color: '#ede9fe', to: '/staff/announcements' },
    { label: 'Resident Records', icon: '👥', color: '#ecfdf5', to: '/staff/residents' },
    ...(user?.role === 'admin' ? [{ label: 'Admin Accounts', icon: '🛡️', color: '#fff7ed', to: '/staff/accounts' }] : []),
    { label: 'Transaction Logs', icon: '📋', color: '#f1f5f9', to: '/staff/logs' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Staff Dashboard</h2>
          <p>Welcome back, {user?.first_name}! Here's your overview.</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        {statCards.map(({ label, value, icon, color, to }) => (
          <div key={label} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate(to)}>
            <div className="stat-icon" style={{ background: color, fontSize: 22 }}>{icon}</div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ color: value > 0 ? 'var(--danger)' : 'var(--text)' }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <div className="card">
        <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Quick Access</h3>
        <div className="grid-4">
          {quickCards.map(({ label, icon, color, to }) => (
            <div key={label} className="quick-card" onClick={() => navigate(to)}>
              <div className="quick-card-icon" style={{ background: color }}>{icon}</div>
              <span className="quick-card-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
