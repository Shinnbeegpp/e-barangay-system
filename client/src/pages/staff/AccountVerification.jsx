import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { CheckCircle, XCircle, Eye, X } from 'lucide-react';
import { format } from 'date-fns';

export default function AccountVerification() {
  const [queue, setQueue] = useState([]);
  const [selected, setSelected] = useState(null);
  const [denialReason, setDenialReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/staff/verification').then(r => setQueue(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openAction = (res, action) => {
    setSelected(res);
    setActionType(action);
    setDenialReason('');
    setShowModal(true);
  };

  const handleAction = async () => {
    if (actionType === 'deny' && !denialReason.trim()) return toast.error('Please provide a denial reason');
    setLoading(true);
    try {
      await api.put(`/staff/verification/${selected.user_id}`, {
        action: actionType === 'approve' ? 'approve' : 'deny',
        denial_reason: denialReason
      });
      toast.success(`Account ${actionType === 'approve' ? 'approved' : 'denied'} successfully`);
      setShowModal(false);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error processing verification');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Account Verification</h2><p>Review and process resident profile verification requests</p></div>
        <span style={{ background: 'var(--accent-light)', color: '#92400e', padding: '4px 12px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
          {queue.length} Pending
        </span>
      </div>

      {queue.length === 0 ? (
        <div className="card"><div className="empty-state"><h3>No Pending Verifications</h3><p>All resident verifications are up to date.</p></div></div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Resident</th><th>Email</th><th>Mobile</th><th>Address</th><th>Submitted</th><th>Documents</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map(r => (
                  <tr key={r.user_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {r.profile_picture
                          ? <img src={`http://localhost:5000${r.profile_picture}`} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                          : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>
                        }
                        <div>
                          <div style={{ fontWeight: 600 }}>{r.first_name} {r.middle_name ? r.middle_name[0] + '. ' : ''}{r.last_name} {r.suffix || ''}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.gender} · {r.civil_status}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{r.email}</td>
                    <td style={{ fontSize: 13 }}>{r.mobile_number}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.house_number} {r.street_purok_sitio}, Tinurik</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.submitted_at ? format(new Date(r.submitted_at), 'MMM d, yyyy') : '—'}</td>
                    <td>
                      {r.valid_id && <a href={`http://localhost:5000${r.valid_id}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View ID</a>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-success btn-sm" onClick={() => openAction(r, 'approve')}><CheckCircle size={14} /> Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => openAction(r, 'deny')}><XCircle size={14} /> Deny</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && selected && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{actionType === 'approve' ? '✅ Approve Account' : '❌ Deny Account'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <p style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 14 }}>
              {actionType === 'approve'
                ? `Are you sure you want to approve the account of ${selected.first_name} ${selected.last_name}? They will gain access to all barangay services.`
                : `You are about to deny the verification of ${selected.first_name} ${selected.last_name}. Please provide a reason.`}
            </p>
            {actionType === 'deny' && (
              <div className="form-group">
                <label className="form-label">Denial Reason *</label>
                <textarea className="form-textarea" style={{ minHeight: 80 }}
                  placeholder="e.g., Invalid ID submitted, incomplete information, etc."
                  value={denialReason} onChange={e => setDenialReason(e.target.value)} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className={`btn ${actionType === 'approve' ? 'btn-success' : 'btn-danger'}`} onClick={handleAction} disabled={loading}>
                {loading ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Deny'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
