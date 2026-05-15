import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { FileText, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function DocumentRequest() {
  const [form, setForm] = useState({ document_type: '', reason: '', mode: '' });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
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
                      {r.status === 'denied' && <span style={{ color: 'var(--danger)' }}>{r.denial_reason}</span>}
                      {r.status === 'ready' && r.pickup_date && <span style={{ color: 'var(--success)' }}>Pickup: {format(new Date(r.pickup_date), 'MMM d, yyyy h:mm a')}</span>}
                      {r.soft_copy_url && <a href={`http://localhost:5000${r.soft_copy_url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Download</a>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
