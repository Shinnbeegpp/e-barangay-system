import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Heart, Lock, Upload, Send } from 'lucide-react';

export default function AssistancePortal() {
  const [programs, setPrograms] = useState([]);
  const [selected, setSelected] = useState(null);
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);

  const loadPrograms = () => api.get('/assistance/programs').then(r => setPrograms(r.data)).catch(() => {});
  useEffect(() => { loadPrograms(); }, []);

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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting application');
    } finally { setLoading(false); }
  };

  const medical = programs.find(p => p.program_type === 'medical');
  const educational = programs.find(p => p.program_type === 'educational');

  const ProgramCard = ({ prog, type, icon, title, desc }) => {
    const locked = prog?.is_locked;
    return (
      <div className="card" style={{ opacity: locked ? .7 : 1, border: selected === type ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 32 }}>{icon}</div>
          <div>
            <h3 style={{ fontWeight: 700 }}>{title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{desc}</p>
          </div>
          {locked && <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}><Lock size={14} /> Unavailable</span>}
          {!locked && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>✅ Available</span>}
        </div>
        {!locked && (
          <button className={`btn ${selected === type ? 'btn-outline' : 'btn-primary'} btn-sm`}
            onClick={() => setSelected(selected === type ? null : type)}>
            {selected === type ? 'Cancel' : 'Apply Now'}
          </button>
        )}
        {locked && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>This assistance program is currently unavailable. Check back later.</p>}
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Assistance Portal</h2><p>Apply for available barangay assistance programs</p></div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <ProgramCard prog={medical} type="medical" icon="🏥" title="Medical Assistance"
          desc="Financial aid for medical needs and hospitalization" />
        <ProgramCard prog={educational} type="educational" icon="🎓" title="Educational Assistance"
          desc="Support for students' educational expenses" />
      </div>

      {selected === 'medical' && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>🏥 Medical Assistance Application</h3>
          <div className="alert alert-info">Please upload the required documents to process your medical assistance application.</div>
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
              <button className="btn btn-primary" type="submit" disabled={loading}>
                <Send size={15} /> {loading ? 'Submitting...' : 'Submit Application'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {selected === 'educational' && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>🎓 Educational Assistance Application</h3>
          <div className="alert alert-info">Please upload the required documents to process your educational assistance application.</div>
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
              <button className="btn btn-primary" type="submit" disabled={loading}>
                <Send size={15} /> {loading ? 'Submitting...' : 'Submit Application'}
              </button>
              <button className="btn btn-outline" type="button" onClick={() => setSelected(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
