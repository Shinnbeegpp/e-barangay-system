import { useEffect, useState } from 'react';
import ResidentLayout from '../../components/ResidentLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { format } from 'date-fns';
import { Plus, X, FileText } from 'lucide-react';

const DOC_TYPES = ['Barangay Clearance', 'Certificate of Residency', 'Certificate of Indigency', 'Barangay ID'];
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function ResidentDocuments() {
  const [requests, setRequests] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ document_type: '', reason: '', mode: 'pickup' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([api.get('/documents/my'), api.get('/profile')])
      .then(([docs, prof]) => { setRequests(docs.data); setProfile(prof.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/documents', form);
      toast.success('Document request submitted!');
      setShowModal(false);
      setForm({ document_type: '', reason: '', mode: 'pickup' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const isVerified = profile?.verification_status === 'verified';

  return (
    <ResidentLayout title="Document Requests">
      <div className="page-header">
        <div><h2>Document Requests</h2><p>Request official barangay documents and certificates</p></div>
        <button className="btn btn-primary" onClick={() => isVerified ? setShowModal(true) : toast.error('Your account must be verified first')} >
          <Plus size={16} /> New Request
        </button>
      </div>

      {!isVerified && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          ⚠️ Your account must be <strong>verified</strong> before requesting documents.
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No Requests Yet</h3>
            <p>Submit your first document request above.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Document</th>
                  <th>Reason</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td><strong>{r.document_type}</strong></td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
                    <td>{r.mode === 'pickup' ? '🏛️ Pick Up' : '📧 Soft Copy'}</td>
                    <td><Badge status={r.status} /></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{format(new Date(r.requested_at), 'MMM d, yyyy')}</td>
                    <td>
                      {r.status === 'denied' && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{r.denial_reason}</span>}
                      {r.pickup_date && <span style={{ fontSize: 12, color: 'var(--success)' }}>Pick up: {format(new Date(r.pickup_date), 'MMM d, yyyy h:mm a')}</span>}
                      {r.soft_copy_url && <a href={`${API_BASE}${r.soft_copy_url}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">Download</a>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>New Document Request</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Document Type *</label>
                <select className="form-select" value={form.document_type} onChange={e => setForm({ ...form, document_type: e.target.value })} required>
                  <option value="">-- Select document --</option>
                  {DOC_TYPES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Purpose / Reason *</label>
                <textarea className="form-textarea" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="State your purpose for this document..." required />
              </div>
              <div className="form-group">
                <label className="form-label">Mode of Acquisition *</label>
                <select className="form-select" value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
                  <option value="pickup">🏛️ Pick Up at Barangay Hall</option>
                  <option value="soft_copy">📧 Soft Copy (Digital)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ResidentLayout>
  );
}
