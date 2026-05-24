import { useEffect, useState } from 'react';
import StaffLayout from '../../components/StaffLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function StaffVerification() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [denyReason, setDenyReason] = useState('');
  const [modal, setModal] = useState(null); // 'view' | 'deny'
  const [processing, setProcessing] = useState(false);

  const load = () => {
    api.get('/staff/verification').then(r => setQueue(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (action) => {
    if (action === 'deny' && modal !== 'deny') { setModal('deny'); return; }
    setProcessing(true);
    try {
      await api.put(`/staff/verification/${selected.user_id}`, { action, denial_reason: denyReason });
      toast.success(`Account ${action === 'approve' ? 'approved' : 'denied'}`);
      setModal(null); setSelected(null); setDenyReason('');
      load();
    } catch {
      toast.error('Failed to update');
    } finally { setProcessing(false); }
  };

  return (
    <StaffLayout title="Account Verification">
      <div className="page-header">
        <div><h2>Account Verification</h2><p>{queue.length} resident(s) awaiting review</p></div>
      </div>

      <div className="card">
        {loading ? <div className="loading-center"><div className="spinner" /></div>
        : queue.length === 0 ? (
          <div className="empty-state">
            <CheckCircle size={48} />
            <h3>All Clear!</h3>
            <p>No pending verifications.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Address</th><th>Submitted</th><th>Actions</th></tr></thead>
              <tbody>
                {queue.map(r => (
                  <tr key={r.user_id}>
                    <td><strong>{r.first_name} {r.last_name}</strong><br/><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.gender} · {r.civil_status}</span></td>
                    <td>{r.email}</td>
                    <td style={{ fontSize: 12 }}>{r.house_number} {r.street_purok_sitio},<br/>Brgy. {r.barangay}, {r.municipality}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>{r.submitted_at ? format(new Date(r.submitted_at), 'MMM d, yyyy') : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => { setSelected(r); setModal('view'); }}>View</button>
                        <button className="btn btn-sm btn-success" onClick={() => { setSelected(r); handleAction('approve'); }}>Approve</button>
                        <button className="btn btn-sm btn-danger" onClick={() => { setSelected(r); setModal('deny'); }}>Deny</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h3>Profile: {selected.first_name} {selected.last_name}</h3>
              <button className="modal-close" onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 13 }}>
              {[
                ['Email', selected.email], ['Mobile', selected.mobile_number],
                ['Gender', selected.gender], ['Civil Status', selected.civil_status],
                ['Date of Birth', selected.date_of_birth?.split('T')[0]], ['Nationality', selected.nationality],
                ['Religion', selected.religion || '—'], ['Emergency Contact', selected.emergency_contact_person],
                ['Emergency No.', selected.emergency_contact_number], ['Address', `${selected.house_number} ${selected.street_purok_sitio}, Brgy. ${selected.barangay}`],
              ].map(([label, val]) => (
                <div key={label} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</div>
                  <div>{val}</div>
                </div>
              ))}
            </div>
            {selected.profile_picture && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>Profile Picture</div>
                <img src={`${API_BASE}${selected.profile_picture}`} alt="Profile"
                  style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
              </div>
            )}
            {selected.valid_id && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>Valid ID</div>
                <a href={`${API_BASE}${selected.valid_id}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">View ID</a>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn btn-success" disabled={processing}
                onClick={() => { handleAction('approve'); setModal(null); }}>
                <CheckCircle size={16} /> Approve
              </button>
              <button className="btn btn-danger" onClick={() => setModal('deny')}>
                <XCircle size={16} /> Deny
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deny Modal */}
      {modal === 'deny' && selected && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Deny Verification</h3>
              <button className="modal-close" onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              You are denying <strong>{selected.first_name} {selected.last_name}</strong>. Please provide a reason.
            </p>
            <div className="form-group">
              <label className="form-label">Reason for Denial *</label>
              <textarea className="form-textarea" value={denyReason} onChange={e => setDenyReason(e.target.value)}
                placeholder="e.g. Invalid ID submitted, incomplete information..." required />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={processing || !denyReason} onClick={() => handleAction('deny')}>
                <XCircle size={16} /> Confirm Denial
              </button>
            </div>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}
