import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { Send, Download, X, AlertCircle } from 'lucide-react';
import { fileUrl } from '../../api/axios';

import { format } from 'date-fns';

const toLocal = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(d.getTime() + (8 * 60 * 60 * 1000));
};

export default function DocumentRequest() {
  const [form, setForm] = useState({ document_type: '', reason: '', mode: '' });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noteModal, setNoteModal] = useState(null);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const load = () => api.get('/documents/my').then(r => setRequests(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/documents', form);
      toast.success('Document request submitted!');
      setForm({ document_type: '', reason: '', mode: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting request');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Document Requests</h2><p>Request official barangay documents and certificates</p></div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, fontWeight: 700 }}>📋 New Document Request</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Document Type *</label>
            <select className="form-select" value={form.document_type} onChange={set('document_type')} required>
              <option value="">Select document...</option>
              <option>Barangay Clearance</option>
              <option>Certificate of Residency</option>
              <option>Certificate of Indigency</option>
              <option>Barangay ID</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Purpose / Reason *</label>
            <textarea className="form-textarea" placeholder="State your purpose for requesting this document..." value={form.reason} onChange={set('reason')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Mode of Acquisition *</label>
            <select className="form-select" value={form.mode} onChange={set('mode')} required>
              <option value="">Select mode...</option>
              <option value="soft_copy">Soft Copy (Digital)</option>
              <option value="pickup">Pick Up at Barangay Hall</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            <Send size={15} /> {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16, fontWeight: 700 }}>📂 My Requests</h3>
        {requests.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}><p>No requests yet.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Document</th><th>Reason</th><th>Mode</th><th>Status</th><th>Date</th><th>Note</th></tr></thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.document_type}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
                    <td>{r.mode === 'soft_copy' ? 'Soft Copy' : 'Pick Up'}</td>
                    <td><Badge status={r.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(r.requested_at), 'MMM d, yyyy')}</td>
                    <td style={{ fontSize: 12 }}>
                      {r.status === 'denied' && r.denial_reason && (
                        <button onClick={() => setNoteModal({ type: 'denied', text: r.denial_reason, updated_at: r.updated_at })}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--danger-light, #fff0f0)', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          <AlertCircle size={11} /> View Reason
                        </button>
                      )}
                      {r.status === 'ready' && r.pickup_date && (
                        <button onClick={() => setNoteModal({ type: 'pickup', text: format(new Date(r.pickup_date), 'MMMM d, yyyy h:mm a') })}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--success-light, #f0fff4)', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          📅 Pickup Schedule
                        </button>
                      )}
                      {r.soft_copy_url && (
                        <a href={fileUrl(r.soft_copy_url)} target="_blank" rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--primary)', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, textDecoration: 'none' }}>
                          <Download size={11} /> Download
                        </a>
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
              <h3>{noteModal.type === 'denied' ? '❌ Denial Reason' : '📅 Pickup Schedule'}</h3>
              <button className="modal-close" onClick={() => setNoteModal(null)}><X size={20} /></button>
            </div>
            <p style={{ color: noteModal.type === 'denied' ? 'var(--danger)' : noteModal.type === 'success' ? 'var(--success)' : 'var(--text)', lineHeight: 1.7, fontSize: 14, marginBottom: noteModal.updated_at ? 12 : 0 }}>
              {noteModal.text}
            </p>
            {noteModal.updated_at && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                🕐 Updated on {format(toLocal(noteModal.updated_at), 'MMMM d, yyyy h:mm a')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
      
