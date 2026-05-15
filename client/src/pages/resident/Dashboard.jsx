import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { User, FileText, Heart, AlertTriangle, Clock, Settings, Megaphone } from 'lucide-react';
import { format } from 'date-fns';

export default function ResidentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/announcements').then(r => setAnnouncements(r.data)).catch(() => {});
    api.get('/profile').then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const verStatus = profile?.verification_status || 'unverified';

  const alertMap = {
    unverified: { cls: 'alert-warning', msg: '⚠️ Please complete and submit your profile for verification to access all barangay services.' },
    pending: { cls: 'alert-info', msg: '🕐 Your profile is pending verification by barangay staff.' },
    verified: { cls: 'alert-success', msg: '✅ Your account is verified. You have full access to all services.' },
    denied: { cls: 'alert-danger', msg: `❌ Your verification was denied. Reason: ${profile?.denial_reason || 'N/A'}. Please update your profile and resubmit.` },
  };

  const quickCards = [
    { label: 'Profile', icon: '👤', color: '#dbeafe', to: '/resident/profile' },
    { label: 'Document Requests', icon: '📄', color: '#d1fae5', to: '/resident/documents' },
    { label: 'Assistance Portal', icon: '❤️', color: '#fce7f3', to: '/resident/assistance' },
    { label: 'Incident Report', icon: '⚠️', color: '#fef3c7', to: '/resident/incidents' },
    { label: 'My Tracker', icon: '🔍', color: '#ede9fe', to: '/resident/tracker' },
    { label: 'Account Settings', icon: '⚙️', color: '#f1f5f9', to: '/resident/settings' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Welcome, {user?.first_name}! 👋</h2>
          <p>Barangay Tinurik Resident Portal</p>
        </div>
      </div>

      {alertMap[verStatus] && (
        <div className={`alert ${alertMap[verStatus].cls}`}>{alertMap[verStatus].msg}</div>
      )}

      <div className="grid-3" style={{ marginBottom: 32 }}>
        {quickCards.map(({ label, icon, color, to }) => (
          <div key={label} className="quick-card" onClick={() => navigate(to)}>
            <div className="quick-card-icon" style={{ background: color }}>{icon}</div>
            <span className="quick-card-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Megaphone size={18} color="var(--primary)" />
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Announcements</h3>
        </div>
        {announcements.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <p>No announcements at this time.</p>
          </div>
        ) : (
          announcements.map(a => (
            <div key={a.id} className="announcement-card">
              <h4>{a.title}</h4>
              <p>{a.content}</p>
              <div className="announcement-meta">
                Posted by {a.first_name} {a.last_name} · {format(new Date(a.created_at), 'MMM d, yyyy')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
