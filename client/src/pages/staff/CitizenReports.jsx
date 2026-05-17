import { useState, useEffect } from 'react';
import api, { fileUrl } from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const toLocal = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(d.getTime() + (8 * 60 * 60 * 1000));
};

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
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(toLocal(r.reported_at), 'MMM d, yyyy')}</td>
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
            <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', marginBottom: 18, border: '1px solid var(--border)' }}>
              {/* Header: name + badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 3 }}>{selected.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Filed by <strong>{selected.first_name} {selected.last_name}</strong> · {format(toLocal(selected.reported_at), 'MMM d, yyyy h:mm a')}</div>
                </div>
                <Badge status={selected.status} />
              </div>

              {/* Meta grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: 13, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Location</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>📍 {selected.location}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Email</div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>{selected.email}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Description</div>
                  <div style={{ color: 'var(--text)', lineHeight: 1.6 }}>{selected.description}</div>
                </div>
              </div>

              {/* Attached photo */}
              {selected.image_url && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Attached Photo</div>
                  <img src={fileUrl(selected.image_url)} alt="evidence"
                    style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                </>
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
