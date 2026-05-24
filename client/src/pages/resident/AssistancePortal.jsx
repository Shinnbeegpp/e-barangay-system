import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Badge from '../../components/Badge';
import { Lock, Send, Upload, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const toLocal = (dateStr) => {
  return new Date(dateStr);
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
  const [noteModal, setNoteModal] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  const loadPrograms = () => api.get('/assistance/programs').then(r => setPrograms(r.data)).catch(() => {});

  const handleCancel = async () => {
    try {
      await api.put(`/assistance/${confirmCancel}/cancel`);
      toast.success('Application cancelled');
      setConfirmCancel(null);
      loadApps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error cancelling application');
    }
  };

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
              <label className="form-label">Medical Abstract * <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>(PDF or Image)</span></label>
              {!files.medical_abstract && (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 16px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--surface2)', transition: 'border-color .2s', maxWidth: 360 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-light)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <input type="file" accept="image/*,.pdf" onChange={setFile('medical_abstract')} style={{ display: 'none' }} required />
                  <Upload size={20} color="var(--text-muted)" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Click to upload Medical Abstract</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>PNG, JPG, PDF up to 5MB</span>
                </label>
              )}
              {files.medical_abstract && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', }}>
                  <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, flex: 1 }}>✅ {files.medical_abstract.name}</span>
                  <button type="button" onClick={() => setFiles({ ...files, medical_abstract: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Medical Bill / Statement of Account * <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400 }}>(PDF or Image)</span></label>
              {!files.medical_bill && (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 16px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--surface2)', transition: 'border-color .2s', maxWidth: 360 }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-light)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <input type="file" accept="image/*,.pdf" onChange={setFile('medical_bill')} style={{ display: 'none' }} required />
                  <Upload size={20} color="var(--text-muted)" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Click to upload Medical Bill</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>PNG, JPG, PDF up to 5MB</span>
                </label>
              )}
              {files.medical_bill && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, flex: 1 }}>✅ {files.medical_bill.name}</span>
                  <button type="button" onClick={() => setFiles({ ...files, medical_bill: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                </div>
              )}
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
            {[
              { key: 'enrollment_certificate', label: 'Certificate of Enrollment', accept: 'image/*,.pdf', hint: 'PNG, JPG, PDF up to 5MB', placeholder: 'Click to upload Certificate of Enrollment' },
              { key: 'grades_file', label: 'Grades / Report Card', accept: 'image/*,.pdf', hint: 'PNG, JPG, PDF up to 5MB', placeholder: 'Click to upload Grades / Report Card' },
              { key: 'school_id', label: 'School ID', accept: 'image/*,.pdf', hint: 'PNG, JPG, PDF up to 5MB', placeholder: 'Click to upload School ID' },
            ].map(({ key, label, accept, hint, placeholder }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label} *</label>
                {!files[key] && (
                  <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 16px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--surface2)', transition: 'border-color .2s', maxWidth: 360 }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <input type="file" accept={accept} onChange={setFile(key)} style={{ display: 'none' }} required />
                    <Upload size={20} color="var(--text-muted)" />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{placeholder}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hint}</span>
                  </label>
                )}
                {files[key] && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                    <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, flex: 1 }}>✅ {files[key].name}</span>
                    <button type="button" onClick={() => setFiles({ ...files, [key]: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                  </div>
                )}
              </div>
            ))}
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
                    <td style={{ fontSize: 12 }}>
                      {a.status === 'denied' && a.denial_reason && (
                        <button onClick={() => setNoteModal({ text: a.denial_reason, updated_at: a.updated_at })}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff0f0', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          <AlertCircle size={11} /> View Reason
                        </button>
                      )}
                      {a.status === 'pending' && (
                        <button onClick={() => setConfirmCancel(a.id)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff0f0', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          ✕ Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {noteModal && (
        <div className="modal-overlay" onClick={() => setNoteModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>❌ Denial Reason</h3>
              <button className="modal-close" onClick={() => setNoteModal(null)}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--danger)', lineHeight: 1.7, fontSize: 14, marginBottom: noteModal.updated_at ? 12 : 0 }}>{noteModal.text}</p>
            {noteModal.updated_at && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                🕐 Updated on {format(toLocal(noteModal.updated_at), 'MMMM d, yyyy h:mm a')}
              </div>
            )}
          </div>
        </div>
      )}
      {confirmCancel && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3>Cancel Application</h3>
              <button className="modal-close" onClick={() => setConfirmCancel(null)}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
              Are you sure you want to cancel this assistance application? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setConfirmCancel(null)}>No, Keep it</button>
              <button className="btn btn-danger" onClick={handleCancel}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}