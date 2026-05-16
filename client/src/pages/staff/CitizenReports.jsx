import { useState, useEffect } from 'react';
import api, { SERVER_URL } from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { X } from 'lucide-react';
import { format } from 'date-fns';

export default function CitizenReports() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: '', staff_notes: '' });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = () => api.get('/incidents').then(r => setReports(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openReport = (r) => {
    setSelected(r);
    setForm({ status: r.status, staff_notes: r.staff_notes || '' });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await api.put(`/incidents/${selected.id}`, form);
      toast.success('Report updated');
      setSelected(null);
      load();
    } catch {
      toast.error('Error updating report');
    } finally { setLoading(false); }
  };

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  return (
    <div>
      <div className="page-header">
        <div><h2>Citizen Reports</h2><p>Review and act on community incident reports</p></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'pending', 'reviewed', 'resolved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            style={{ textTransform: 'capitalize' }}>
            {f} {f !== 'all' && `(${reports.filter(r => r.status === f).length})`}
          </button>
        ))}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}><p>No {filter !== 'all' ? filter : ''} reports found.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Resident</th><th>Title</th><th>Location</th><th>Status</th><th>Filed</th><th>Action</th></tr></thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.first_name} {r.last_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.email}</div>
                    </td>
                    <td style={{ fontWeight: 500, maxWidth: 200 }}>{r.title}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.location}</td>
                    <td><Badge status={r.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(r.reported_at), 'MMM d, yyyy')}</td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => openReport(r)}>View & Act</button>
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
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>⚠️ Incident Report Details</h3>
              <button className="modal-close" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{selected.title}</div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 8, fontSize: 12 }}>Filed by: {selected.first_name} {selected.last_name} · {format(new Date(selected.reported_at), 'MMM d, yyyy h:mm a')}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>📍 Location: {selected.location}</div>
              <hr className="divider" style={{ margin: '10px 0' }} />
              <p style={{ lineHeight: 1.6 }}>{selected.description}</p>
              {selected.image_url && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Attached Photo</div>
                  <img src={`${SERVER_URL}${selected.image_url}`} alt="evidence"
                    style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Staff Notes / Action Taken</label>
              <textarea className="form-textarea" value={form.staff_notes}
                onChange={e => setForm({ ...form, staff_notes: e.target.value })}
                placeholder="Enter action taken or notes..." />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
              <button className="btn btn-primary" onClick={handleUpdate} disabled={loading}>
                {loading ? 'Saving...' : 'Save Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
