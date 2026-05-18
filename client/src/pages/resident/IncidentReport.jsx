import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { AlertTriangle, Send, X} from 'lucide-react';
import { format } from 'date-fns';

const toLocal = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(d.getTime() + (8 * 60 * 60 * 1000));
};

export default function IncidentReport() {
  const [form, setForm] = useState({ title: '', description: '', location: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [reports, setReports] = useState([]);
  const [noteModal, setNoteModal] = useState(null);

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleCancel = async () => {
    try {
      await api.put(`/incidents/${confirmCancel}/cancel`);
      toast.success('Report cancelled');
      setConfirmCancel(null);
      loadReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling report');
    }
  };

  const loadReports = () => api.get('/incidents/my').then(r => setReports(r.data)).catch(() => {});
  useEffect(() => { loadReports(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('location', form.location);
      if (imageFile) fd.append('image', imageFile);
      await api.post('/incidents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Incident report filed successfully!');
      setForm({ title: '', description: '', location: '' });
      setImageFile(null);
      loadReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error filing report');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Incident Report</h2><p>File complaints, reports, or concerns to barangay officials</p></div>
      </div>

      <div className="alert alert-warning">
        ⚠️ Please only use this form to report legitimate incidents. False reports may result in account suspension.
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <AlertTriangle size={20} color="var(--warning)" />
          <h3 style={{ fontWeight: 700 }}>File an Incident Report</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Report Title *</label>
            <input className="form-input" placeholder="Brief title describing the incident" value={form.title} onChange={set('title')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" style={{ minHeight: 120 }}
              placeholder="Provide a detailed description of the incident..."
              value={form.description} onChange={set('description')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <input className="form-input" placeholder="Where did the incident occur?"
              value={form.location} onChange={set('location')} required />
          </div>
          <div className="form-group">
            <label className="form-label">
              Photo / Evidence <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
            </label>
            <div style={{ border: '2px dashed var(--border)', borderRadius: 10, overflow: 'hidden', maxWidth: 360 }}>
              {/* Placeholder or preview */}
              {!imageFile ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 16px', background: 'var(--surface2)' }}>
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 8 }}>
                    <rect width="56" height="56" rx="10" fill="#f1f5f9"/>
                    <path d="M14 38l10-12 7 8 5-6 6 10H14z" fill="#cbd5e1"/>
                    <circle cx="20" cy="22" r="4" fill="#cbd5e1"/>
                    <path d="M28 16v8M24 20l4-4 4 4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No photo selected</span>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img src={URL.createObjectURL(imageFile)} alt="preview"
                    style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
                  <button type="button" onClick={() => setImageFile(null)}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    ✕ Remove
                  </button>
                </div>
              )}
              {/* Buttons at the bottom */}
              <div style={{ display: 'flex', gap: 0, borderTop: '1px solid var(--border)' }}>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
                  <input type="file" accept="image/*" capture="environment" onChange={e => setImageFile(e.target.files[0])} style={{ display: 'none' }} />
                  📷 Take Photo
                </label>
                <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: 'var(--surface)' }}>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ display: 'none' }} />
                  📁 Choose File
                </label>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            <Send size={15} /> {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16, fontWeight: 700 }}>📋 My Incident Reports</h3>
        {reports.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}><p>No reports filed yet.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Title</th><th>Location</th><th>Status</th><th>Filed</th><th>Staff Notes</th></tr></thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.title}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.location}</td>
                    <td><Badge status={r.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(toLocal(r.reported_at), 'MMM d, yyyy')}</td>
                    <td style={{ fontSize: 12 }}>
                      {r.staff_notes ? (
                        <button onClick={() => setNoteModal(r)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          📋 View Notes
                        </button>
                      ) : ''}
                      {r.status === 'pending' && (
                        <button onClick={() => setConfirmCancel(r.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff0f0', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer', marginLeft: 4 }}>
                          ✕ Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {noteModal && (
        <div className="modal-overlay" onClick={() => setNoteModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Staff Notes</h3>
              <button className="modal-close" onClick={() => setNoteModal(null)}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text)', lineHeight: 1.7, fontSize: 14, marginBottom: 12 }}>{noteModal.staff_notes}</p>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              🕐 Updated on {format(toLocal(noteModal.updated_at), 'MMM d, yyyy h:mm a')}
            </div>
          </div>
        </div>
      )}

      {confirmCancel && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3>Cancel Report</h3>
              <button className="modal-close" onClick={() => setConfirmCancel(null)}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              Are you sure you want to cancel this incident report? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setConfirmCancel(null)}>No, Keep it</button>
              <button className="btn btn-danger" onClick={handleCancel}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}