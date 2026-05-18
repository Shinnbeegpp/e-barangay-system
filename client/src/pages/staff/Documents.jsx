import { useState, useEffect } from 'react';
import api, {SERVER_URL} from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { X, CheckCircle, Upload } from 'lucide-react';
import { format } from 'date-fns';

export default function StaffDocuments() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalData, setModalData] = useState({ status: '', denial_reason: '', pickup_date: '' });
  const [softCopyFile, setSoftCopyFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = () => api.get('/documents').then(r => setRequests(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openModal = (req) => {
    setSelected(req);
    setModalData({ status: req.status, denial_reason: '', pickup_date: '' });
    setSoftCopyFile(null);
  };

  const handleProcess = async () => {
    if (!modalData.status) return toast.error('Please select a status');
    if (modalData.status === 'denied' && !modalData.denial_reason) return toast.error('Please provide denial reason');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('status', modalData.status);
      if (modalData.denial_reason) fd.append('denial_reason', modalData.denial_reason);
      if (modalData.pickup_date) fd.append('pickup_date', modalData.pickup_date);
      if (softCopyFile) fd.append('soft_copy', softCopyFile);
      await api.put(`/documents/${selected.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Request updated successfully');
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating request');
    } finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <div>
      <div className="page-header">
        <div><h2>Document Requests</h2><p>Process and manage resident document requests</p></div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'pending', 'processing', 'ready', 'completed', 'denied'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            style={{ textTransform: 'capitalize' }}>
            {f} {f !== 'all' && `(${requests.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}><p>No {filter !== 'all' ? filter : ''} requests found.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Resident</th><th>Document</th><th>Mode</th><th>Reason</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.first_name} {r.last_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.email}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{r.document_type}</td>
                    <td style={{ fontSize: 12 }}>{r.mode === 'soft_copy' ? '💾 Soft Copy' : '🏛️ Pick Up'}</td>
                    <td style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
                    <td><Badge status={r.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(r.requested_at), 'MMM d, yyyy')}</td>
                    <td>
                      {r.status !== 'cancelled' && (
                        <button className="btn btn-primary btn-sm" onClick={() => openModal(r)}>Process</button>
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
              <h3>Process Document Request</h3>
              <button className="modal-close" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', marginBottom: 18, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                {selected.profile_picture ? (
                  <img src={`${SERVER_URL}${selected.profile_picture}`} alt="profile"
                    style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                    {selected.first_name?.[0]}{selected.last_name?.[0]}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{selected.first_name} {selected.last_name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selected.email}</div>
                </div>
                <Badge status={selected.status} style={{ marginLeft: 'auto' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: 13 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Document Type</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{selected.document_type}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Delivery Mode</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{selected.mode === 'soft_copy' ? '💾 Soft Copy' : '🏛️ Pick Up'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Reason</div>
                  <div style={{ color: 'var(--text)', lineHeight: 1.5 }}>{selected.reason}</div>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Update Status *</label>
              <select className="form-select" value={modalData.status} onChange={e => setModalData({ ...modalData, status: e.target.value })}>
                <option value="">Select status...</option>
                <option value="processing">Processing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="denied">Denied</option>
              </select>
            </div>
            {modalData.status === 'denied' && (
              <div className="form-group">
                <label className="form-label">Denial Reason *</label>
                <textarea className="form-textarea" style={{ minHeight: 80 }}
                  value={modalData.denial_reason} onChange={e => setModalData({ ...modalData, denial_reason: e.target.value })} />
              </div>
            )}
            {modalData.status === 'ready' && selected.mode === 'pickup' && (
              <div className="form-group">
                <label className="form-label">Available Pickup Date & Time *</label>
                <input className="form-input" type="datetime-local" value={modalData.pickup_date}
                  onChange={e => setModalData({ ...modalData, pickup_date: e.target.value })} />
              </div>
            )}
            {modalData.status === 'completed' && selected.mode === 'soft_copy' && (
              <div className="form-group">
                <label className="form-label">Upload Document <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 12 }}>(PDF or Image)</span></label>
                <label htmlFor="soft-copy-upload" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 6, padding: '20px 16px', borderRadius: 10, border: '2px dashed var(--border)',
                  background: softCopyFile ? 'var(--surface2)' : 'transparent',
                  cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <Upload size={22} color="var(--text-muted)" />
                  {softCopyFile ? (
                    <>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary)' }}>{softCopyFile.name}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to change file</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>Click to upload document</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>PNG, JPG, PDF up to 5MB</span>
                    </>
                  )}
                  <input id="soft-copy-upload" type="file" accept=".pdf,image/*"
                    style={{ display: 'none' }} onChange={e => setSoftCopyFile(e.target.files[0])} />
                </label>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleProcess} disabled={loading}>
                <CheckCircle size={15} /> {loading ? 'Saving...' : 'Confirm & Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
