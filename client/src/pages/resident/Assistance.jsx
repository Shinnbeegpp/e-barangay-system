import { useEffect, useState } from 'react';
import ResidentLayout from '../../components/ResidentLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { X, Lock } from 'lucide-react';

export default function ResidentAssistance() {
  const [programs, setPrograms] = useState([]);
  const [profile, setProfile] = useState(null);
  const [modal, setModal] = useState(null); // 'medical' | 'educational'
  const [files, setFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/assistance/programs'), api.get('/profile')])
      .then(([prog, prof]) => { setPrograms(prog.data); setProfile(prof.data); });
  }, []);

  const isVerified = profile?.verification_status === 'verified';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('program_type', modal);
      Object.entries(files).forEach(([k, v]) => fd.append(k, v));
      await api.post('/assistance', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Application submitted!');
      setModal(null);
      setFiles({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const medical = programs.find(p => p.program_type === 'medical');
  const educational = programs.find(p => p.program_type === 'educational');

  const ProgramCard = ({ prog, type, icon, color, title, description }) => {
    const locked = prog?.is_locked;
    return (
      <div className="card" style={{ textAlign: 'center', border: locked ? '1px solid var(--border)' : '2px solid ' + color, opacity: locked ? 0.7 : 1 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>{description}</p>
        {locked ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13 }}>
            <Lock size={14} /> Currently Unavailable
          </div>
        ) : (
          <button className="btn btn-primary btn-full"
            onClick={() => isVerified ? setModal(type) : toast.error('Account must be verified')}>
            Apply Now
          </button>
        )}
      </div>
    );
  };

  return (
    <ResidentLayout title="Assistance Portal">
      <div className="page-header">
        <div><h2>Assistance Portal</h2><p>Apply for available barangay assistance programs</p></div>
      </div>

      {!isVerified && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          ⚠️ Your account must be <strong>verified</strong> before applying for assistance.
        </div>
      )}

      <div className="grid-2">
        <ProgramCard prog={medical} type="medical" icon="🏥" color="#dc2626"
          title="Medical Assistance"
          description="Financial or logistical aid for medical needs of barangay residents." />
        <ProgramCard prog={educational} type="educational" icon="🎓" color="#2563eb"
          title="Educational Assistance"
          description="Support for students enrolled in accredited schools and universities." />
      </div>

      {modal === 'medical' && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>🏥 Medical Assistance Application</h3>
              <button className="modal-close" onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Medical Abstract *</label>
                <input className="form-input" type="file" accept="image/*,application/pdf"
                  onChange={e => setFiles({ ...files, medical_abstract: e.target.files[0] })} required />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Doctor's medical abstract or certificate</span>
              </div>
              <div className="form-group">
                <label className="form-label">Medical Bill *</label>
                <input className="form-input" type="file" accept="image/*,application/pdf"
                  onChange={e => setFiles({ ...files, medical_bill: e.target.files[0] })} required />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hospital or pharmacy bill</span>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'educational' && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>🎓 Educational Assistance Application</h3>
              <button className="modal-close" onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Certificate of Enrollment *</label>
                <input className="form-input" type="file" accept="image/*,application/pdf"
                  onChange={e => setFiles({ ...files, enrollment_certificate: e.target.files[0] })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Grades / Report Card *</label>
                <input className="form-input" type="file" accept="image/*,application/pdf"
                  onChange={e => setFiles({ ...files, grades_file: e.target.files[0] })} required />
              </div>
              <div className="form-group">
                <label className="form-label">School ID *</label>
                <input className="form-input" type="file" accept="image/*,application/pdf"
                  onChange={e => setFiles({ ...files, school_id: e.target.files[0] })} required />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ResidentLayout>
  );
}
