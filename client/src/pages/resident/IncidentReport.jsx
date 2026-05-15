import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { AlertTriangle, Send } from 'lucide-react';

export default function IncidentReport() {
  const [form, setForm] = useState({ title: '', description: '', location: '' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/incidents', form);
      toast.success('Incident report filed successfully!');
      setForm({ title: '', description: '', location: '' });
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
        ⚠️ Please only use this form to report legitimate incidents or concerns. False reports may result in account suspension.
      </div>

      <div className="card">
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
            <textarea className="form-textarea" style={{ minHeight: 140 }}
              placeholder="Provide a detailed description of the incident, including date, time, and persons involved..."
              value={form.description} onChange={set('description')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <input className="form-input" placeholder="Where did the incident occur? (e.g., Purok 3, near Tinurik Elementary School)"
              value={form.location} onChange={set('location')} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            <Send size={15} /> {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
