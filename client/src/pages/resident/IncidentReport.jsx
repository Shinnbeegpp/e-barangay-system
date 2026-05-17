import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { AlertTriangle, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function IncidentReport() {
  const [form, setForm] = useState({ title: '', description: '', location: '' });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);

  const set = k => e => setForm({ ...form, [k]: e.target.value });
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
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: 'var(--surface)', whiteSpace: 'nowrap' }}>
                <input type="file" accept="image/*" capture="environment" onChange={e => setImageFile(e.target.files[0])} style={{ display: 'none' }} />
                📷 Take Photo
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: 'var(--surface)', whiteSpace: 'nowrap' }}>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ display: 'none' }} />
                📁 Choose File
              </label>
              {imageFile && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>✓ {imageFile.name}</span>
              )}
            </div>
            {imageFile && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src={URL.createObjectURL(imageFile)} alt="preview" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setImageFile(null)}>Remove</button>
              </div>
            )}
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
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(r.reported_at), 'MMM d, yyyy')}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.staff_notes || '—'}</td>
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