import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { Lock, Send } from 'lucide-react';
import { format } from 'date-fns';

const toLocal = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
};

const ProgramCard = ({ prog, type, icon, title, desc, selected, onSelect }) => {
  const locked = prog?.is_locked == 1;
  return (
    <div className="card" style={{ opacity: locked ? .7 : 1, border: selected === type ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 32 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontWeight: 700 }}>{title}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{desc}</p>
        </div>
        {locked
          ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}><Lock size={14} /> Unavailable</span>
          : <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>✅ Available</span>
        }
      </div>
      {locked
        ? <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This program is currently unavailable. Check back later.</p>
        : <button className={`btn ${selected === type ? 'btn-outline' : 'btn-primary'} btn-sm`} onClick={() => onSelect(selected === type ? null : type)}>
            {selected === type ? 'Cancel' : 'Apply Now'}
          </button>
      }
    </div>
  );
};

export default function AssistancePortal() {
  const [programs, setPrograms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);

  const loadPrograms = () => api.get('/assistance/programs').then(r => setPrograms(r.data)).catch(() => {});
  const loadApps = () => api.get('/assistance/my').then(r => setApplications(r.data)).catch(() => {});
  useEffect(() => { loadPrograms(); loadApps(); }, []);

  const setFile = k => e => setFiles({ ...files, [k]: e.target.files[0] });

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('program_type', selected);
      Object.entries(files).forEach(([k, v]) => fd.append(k, v));
      await api.post('/assistance', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Application submitted successfully!');
      setSelected(null);
      setFiles({});
      loadApps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting application');
    } finally { setLoading(false); }
  };

  const medical = programs.find(p => p.program_type === 'medical');
  const educational = programs.find(p => p.program_type === 'educational');

  return (
    <div>
      <div className="page-header">
        <div><h2>Assistance Portal</h2><p>Apply for available barangay assistance programs</p></div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <ProgramCard prog={medical} type="medical" icon="🏥" title="Medical Assistance"
          desc="Financial aid for medical needs and hospitalization" selected={selected} onSelect={setSelected} />
        <ProgramCard prog={educational} type="educational" icon="🎓" title="Educational Assistance"
          desc="Support for students' educational expenses" selected={selected} onSelect={setSelected} />
      </div>

      {selected === 'medical' && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>🏥 Medical Assistance Application</h3>
          <div className="alert alert-info">Please upload the required documents to process your application.</div>
          <form onSubmit={handleApply}>
            <div className="form-group">
              <label className="form-label">Medical Abstract * <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>(PDF or Image)</span></label>
              <input className="form-input" type="file" accept="image/*,.pdf" onChange={setFile('medical_abstract')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Medical Bill / Statement of Account * <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>(PDF or Image)</span></label>
              <input className="form-input" type="file" accept="image/*,.pdf" onChange={setFile('medical_bill')} required />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={loading}><Send size={15} /> {loading ? 'Submitting...' : 'Submit Application'}</button>
              <button className="btn btn-outline" type="button" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {selected === 'educational' && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>🎓 Educational Assistance Application</h3>
          <div className="alert alert-info">Please upload the required documents to process your application.</div>
          <form onSubmit={handleApply}>
            <div className="form-group">
              <label className="form-label">Certificate of Enrollment * <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>(PDF or Image)</span></label>
              <input className="form-input" type="file" accept="image/*,.pdf" onChange={setFile('enrollment_certificate')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Grades / Report Card * <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>(PDF or Image)</span></label>
              <input className="form-input" type="file" accept="image/*,.pdf" onChange={setFile('grades_file')} required />
            </div>
            <div className="form-group">
              <label className="form-label">School ID * <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>(Image)</span></label>
              <input className="form-input" type="file" accept="image/*" onChange={setFile('school_id')} required />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" type="submit" disabled={loading}><Send size={15} /> {loading ? 'Submitting...' : 'Submit Application'}</button>
              <button className="btn btn-outline" type="button" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 16, fontWeight: 700 }}>📋 My Assistance Applications</h3>
        {applications.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 0' }}><p>No assistance applications yet.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Program</th><th>Status</th><th>Applied</th><th>Notes</th></tr></thead>
              <tbody>
                {applications.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{a.program_type} Assistance</td>
                    <td><Badge status={a.status} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(toLocal(a.applied_at), 'MMM d, yyyy')}</td>
                    <td style={{ fontSize: 12, color: 'var(--danger)' }}>{a.status === 'denied' && `Reason: ${a.denial_reason}`}</td>
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