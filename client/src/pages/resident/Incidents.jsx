import { useEffect, useState } from 'react';
import ResidentLayout from '../../components/ResidentLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { format } from 'date-fns';
import { AlertTriangle, Send } from 'lucide-react';

export default function ResidentIncidents() {
  const [reports, setReports] = useState([]);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', location: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([api.get('/incidents/my'), api.get('/profile')])
      .then(([inc, prof]) => { setReports(inc.data); setProfile(prof.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/incidents', form);
      toast.success('Incident report filed!');
      setForm({ title: '', description: '', location: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const isVerified = profile?.verification_status === 'verified';

  return (
    <ResidentLayout title="Incident Reporting">
      <div className="page-header">
        <div><h2>Incident Reporting</h2><p>File complaints or concerns to barangay officials</p></div>
      </div>

      {!isVerified && (
        <div className="alert alert-warning">⚠️ Your account must be <strong>verified</strong> to file reports.</div>
      )}

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Form */}
        <div>
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} /> File a Report
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Report Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Brief title of your concern" required disabled={!isVerified} />
              </div>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the incident in detail..." required disabled={!isVerified} style={{ minHeight: 130 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input className="form-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="Where did this occur?" required disabled={!isVerified} />
              </div>
              <button className="btn btn-danger btn-full" type="submit" disabled={submitting || !isVerified}>
                <Send size={16} /> {submitting ? 'Filing Report...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>My Filed Reports</h3>
          {loading ? <div className="loading-center"><div className="spinner" /></div>
          : reports.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <AlertTriangle size={40} />
              <h3>No Reports</h3>
              <p>You haven't filed any reports yet.</p>
            </div>
          ) : (
            reports.map(r => (
              <div key={r.id} className="card card-sm" style={{ marginBottom: 12, borderLeft: '4px solid var(--danger)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <strong style={{ fontSize: 14 }}>{r.title}</strong>
                  <Badge status={r.status} />
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{r.description}</p>
                <p style={{ fontSize: 11, color: 'var(--text-light)' }}>📍 {r.location} · {format(new Date(r.reported_at), 'MMM d, yyyy')}</p>
                {r.staff_notes && <p style={{ fontSize: 12, marginTop: 6, padding: '6px 10px', background: 'var(--surface2)', borderRadius: 6 }}>Staff Note: {r.staff_notes}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </ResidentLayout>
  );
}
