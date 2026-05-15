import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { Lock, Unlock, CheckCircle, XCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { SERVER_URL } from '../../api/axios';

export default function StaffAssistance() {
  const [programs, setPrograms] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('medical');
  const [selected, setSelected] = useState(null);
  const [denialReason, setDenialReason] = useState('');
  const [actionType, setActionType] = useState('');
  const [loading, setLoading] = useState(false);

  const loadPrograms = () => api.get('/assistance/programs').then(r => setPrograms(r.data)).catch(() => {});
  const loadApps = (type) => api.get(`/assistance?type=${type}`).then(r => setApplications(r.data)).catch(() => {});

  useEffect(() => { loadPrograms(); }, []);
  useEffect(() => { loadApps(activeTab); }, [activeTab]);

  const toggleLock = async (type, currentLocked) => {
    try {
      await api.put(`/assistance/programs/${type}`, { is_locked: !currentLocked });
      toast.success(`${type} assistance ${currentLocked ? 'unlocked' : 'locked'}`);
      loadPrograms();
    } catch (err) {
      toast.error('Error updating program status');
    }
  };

  const handleAction = async () => {
    if (actionType === 'denied' && !denialReason.trim()) return toast.error('Please provide a denial reason');
    setLoading(true);
    try {
      await api.put(`/assistance/${selected.id}`, { status: actionType, denial_reason: denialReason });
      toast.success(`Application ${actionType} successfully`);
      setSelected(null);
      loadApps(activeTab);
    } catch (err) {
      toast.error('Error processing application');
    } finally { setLoading(false); }
  };

  const getProg = (type) => programs.find(p => p.program_type === type);

  return (
    <div>
      <div className="page-header">
        <div><h2>Assistance Programs</h2><p>Manage assistance applications and program availability</p></div>
      </div>

      {/* Program cards */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {[
          { type: 'medical', icon: '🏥', label: 'Medical Assistance' },
          { type: 'educational', icon: '🎓', label: 'Educational Assistance' },
        ].map(({ type, icon, label }) => {
          const prog = getProg(type);
          const locked = prog?.is_locked;
          return (
            <div key={type} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{label}</div>
                  <div style={{ fontSize: 12, color: locked ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                    {locked ? '🔒 Locked (Unavailable)' : '🔓 Unlocked (Available)'}
                  </div>
                </div>
              </div>
              <button className={`btn btn-sm ${locked ? 'btn-success' : 'btn-danger'}`}
                onClick={() => toggleLock(type, locked)}>
                {locked ? <><Unlock size={13} /> Unlock</> : <><Lock size={13} /> Lock</>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ key: 'medical', label: '🏥 Medical' }, { key: 'educational', label: '🎓 Educational' }].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`btn btn-sm ${activeTab === t.key ? 'btn-primary' : 'btn-outline'}`}>{t.label}</button>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16, fontWeight: 700, textTransform: 'capitalize' }}>{activeTab} Assistance Applications</h3>
        {applications.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}><p>No applications for this program.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Resident</th><th>Status</th><th>Applied</th><th>Documents</th><th>Actions</th></tr></thead>
              <tbody>
                {applications.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.first_name} {a.last_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.email}</div>
                    </td>
                    <td><Badge status={a.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(a.applied_at), 'MMM d, yyyy')}</td>
                    <td style={{ fontSize: 12 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {a.medical_abstract && <a href={`${SERVER_URL}${a.medical_abstract}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Abstract</a>}
                        {a.medical_bill && <a href={`${SERVER_URL}${a.medical_bill}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Bill</a>}
                        {a.enrollment_certificate && <a href={`${SERVER_URL}${a.enrollment_certificate}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Enrollment</a>}
                        {a.grades_file && <a href={`${SERVER_URL}${a.grades_file}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Grades</a>}
                        {a.school_id && <a href={`${SERVER_URL}${a.school_id}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">School ID</a>}
                      </div>
                    </td>
                    <td>
                      {a.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-success btn-sm" onClick={() => { setSelected(a); setActionType('approved'); setDenialReason(''); }}>
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => { setSelected(a); setActionType('denied'); setDenialReason(''); }}>
                            <XCircle size={13} /> Deny
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{actionType === 'approved' ? '✅ Approve Application' : '❌ Deny Application'}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <p style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 14 }}>
              {actionType === 'approved'
                ? `Approve the ${activeTab} assistance application of ${selected.first_name} ${selected.last_name}?`
                : `Deny the application of ${selected.first_name} ${selected.last_name}. Please provide a reason.`}
            </p>
            {actionType === 'denied' && (
              <div className="form-group">
                <label className="form-label">Denial Reason *</label>
                <textarea className="form-textarea" style={{ minHeight: 80 }}
                  value={denialReason} onChange={e => setDenialReason(e.target.value)} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
              <button className={`btn ${actionType === 'approved' ? 'btn-success' : 'btn-danger'}`} onClick={handleAction} disabled={loading}>
                {loading ? 'Processing...' : actionType === 'approved' ? 'Approve' : 'Deny'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
