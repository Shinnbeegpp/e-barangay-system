import { useState, useEffect } from 'react';
import api, { fileUrl } from '../../api/axios';
import toast from 'react-hot-toast';
import { Save, X, Upload } from 'lucide-react';
import Badge from '../../components/Badge';


export default function ResidentProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [files, setFiles] = useState({});
  const [viewFileUrl, setViewFileUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/profile').then(r => {
      setProfile(r.data);
      setForm({
        first_name: r.data.first_name || '',
        last_name: r.data.last_name || '',
        middle_name: r.data.middle_name || '',
        suffix: r.data.suffix || '',
        gender: r.data.gender || '',
        civil_status: r.data.civil_status || '',
        date_of_birth: r.data.date_of_birth ? r.data.date_of_birth.split('T')[0] : '',
        nationality: r.data.nationality || 'Filipino',
        religion: r.data.religion || '',
        mobile_number: r.data.mobile_number || '',
        emergency_contact_person: r.data.emergency_contact_person || '',
        emergency_contact_number: r.data.emergency_contact_number || '',
        house_number: r.data.house_number || '',
        street_purok_sitio: r.data.street_purok_sitio || '',
      });
    });
  }, []);

  const set = k => e => setForm({ ...form, [k]: e.target.value });
  const setFile = k => e => setFiles({ ...files, [k]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      Object.entries(files).forEach(([k, v]) => fd.append(k, v));
      await api.put('/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Profile submitted for verification!');
      const r = await api.get('/profile');
      setProfile(r.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving profile');
    } finally {
      setLoading(false);
    }
  };

  const verStatus = profile?.verification_status || 'unverified';
  const alertMsg = {
    unverified: { cls: 'alert-warning', msg: '⚠️ Please complete your profile and submit for verification.' },
    pending: { cls: 'alert-info', msg: '🕐 Your profile is pending account verification by barangay staff.' },
    verified: { cls: 'alert-success', msg: '✅ Your account is verified!' },
    denied: { cls: 'alert-danger', msg: `❌ Verification denied. Reason: ${profile?.denial_reason || 'N/A'}. Please update and resubmit.` },
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Profile & Verification</h2>
          <p>Complete your profile to access barangay services</p>
        </div>
        <Badge status={verStatus} />
      </div>

      {alertMsg[verStatus] && (
        <div className={`alert ${alertMsg[verStatus].cls}`}>{alertMsg[verStatus].msg}</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Personal Info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>👤 Basic Personal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-input" value={form.first_name || ''} onChange={set('first_name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Middle Name</label>
              <input className="form-input" value={form.middle_name || ''} onChange={set('middle_name')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="form-input" value={form.last_name || ''} onChange={set('last_name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Suffix (Optional)</label>
              <input className="form-input" placeholder="Jr., Sr., III" value={form.suffix || ''} onChange={set('suffix')} />
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select className="form-select" value={form.gender || ''} onChange={set('gender')} required>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Civil Status *</label>
              <select className="form-select" value={form.civil_status || ''} onChange={set('civil_status')} required>
                <option value="">Select</option>
                <option>Single</option><option>Married</option><option>Widowed</option><option>Separated</option><option>Divorced</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input className="form-input" type="date" value={form.date_of_birth || ''} onChange={set('date_of_birth')} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nationality</label>
              <input className="form-input" value={form.nationality || 'Filipino'} onChange={set('nationality')} />
            </div>
            <div className="form-group">
              <label className="form-label">Religion (Optional)</label>
              <input className="form-input" value={form.religion || ''} onChange={set('religion')} />
            </div>
          </div>
          <div className="form-row">
            {/* Profile Picture */}
            <div className="form-group">
              <label className="form-label">Profile Picture</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Preview / View button */}
                {profile?.profile_picture && (
                  <button type="button" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}
                    onClick={() => setViewFileUrl(fileUrl(profile.profile_picture))}>
                    👁 View Current Photo
                  </button>
                )}
                {/* Upload area */}
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 16px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--surface2)', transition: 'border-color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-light)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <input type="file" accept="image/*" onChange={setFile('profile_picture')} style={{ display: 'none' }} />
                  <Upload size={20} color="var(--text-muted)" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {files.profile_picture ? files.profile_picture.name : 'Click to upload photo'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>PNG, JPG up to 5MB</span>
                </label>
                {/* New file preview */}
                {files.profile_picture && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                    <img src={URL.createObjectURL(files.profile_picture)} alt="preview"
                      style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, flex: 1 }}>New photo selected</span>
                    <button type="button" onClick={() => setFiles({ ...files, profile_picture: null })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Valid ID */}
            <div className="form-group">
              <label className="form-label">Valid ID *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* View current ID button */}
                {profile?.valid_id && (
                  <button type="button" className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}
                    onClick={() => setViewFileUrl(fileUrl(profile.valid_id))}>
                    👁 View Current ID
                  </button>
                )}
                {/* Upload area */}
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 16px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: 'var(--surface2)', transition: 'border-color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-light)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <input type="file" accept="image/*,.pdf" onChange={setFile('valid_id')} style={{ display: 'none' }} />
                  <Upload size={20} color="var(--text-muted)" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {files.valid_id ? files.valid_id.name : 'Click to upload Valid ID'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>PNG, JPG, PDF up to 5MB</span>
                </label>
                {/* New file preview */}
                {files.valid_id && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                    {files.valid_id.type.startsWith('image/') && (
                      <img src={URL.createObjectURL(files.valid_id)} alt="preview"
                        style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                    )}
                    <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600, flex: 1 }}>{files.valid_id.name}</span>
                    <button type="button" onClick={() => setFiles({ ...files, valid_id: null })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>📞 Contact Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input className="form-input" placeholder="09XXXXXXXXX" value={form.mobile_number || ''} onChange={set('mobile_number')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={profile?.email || ''} disabled style={{ background: '#f8fafc' }} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Emergency Contact Person *</label>
              <input className="form-input" value={form.emergency_contact_person || ''} onChange={set('emergency_contact_person')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Contact Number *</label>
              <input className="form-input" placeholder="09XXXXXXXXX" value={form.emergency_contact_number || ''} onChange={set('emergency_contact_number')} required />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>🏠 Address Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">House Number *</label>
              <input className="form-input" value={form.house_number || ''} onChange={set('house_number')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Street / Purok / Sitio *</label>
              <input className="form-input" value={form.street_purok_sitio || ''} onChange={set('street_purok_sitio')} required />
            </div>
          </div>
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Barangay</label>
              <input className="form-input" value="Tinurik" disabled style={{ background: '#f8fafc' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Municipality/City</label>
              <input className="form-input" value="Tanauan City" disabled style={{ background: '#f8fafc' }} />
            </div>
            <div className="form-group">
              <label className="form-label">ZIP Code</label>
              <input className="form-input" value="4232" disabled style={{ background: '#f8fafc' }} />
            </div>
          </div>
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          <Save size={16} /> {loading ? 'Saving...' : 'Save & Submit for Verification'}
        </button>
      </form>

      {viewFileUrl && (
        <div className="modal-overlay" onClick={() => setViewFileUrl(null)}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 File Preview</h3>
              <button className="modal-close" onClick={() => setViewFileUrl(null)}><X size={20} /></button>
            </div>
            <div style={{ textAlign: 'center' }}>
              {viewFileUrl.match(/\.pdf$/i)
                ? <iframe src={viewFileUrl} style={{ width: '100%', height: 500, border: 'none', borderRadius: 8 }} title="File Preview" />
                : <img src={viewFileUrl} alt="Preview" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
              }
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-outline" onClick={() => setViewFileUrl(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
