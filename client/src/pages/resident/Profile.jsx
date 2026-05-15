import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import Badge from '../../components/Badge';
import { SERVER_URL } from '../../api/axios';

export default function ResidentProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [files, setFiles] = useState({});
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
            <div className="form-group">
              <label className="form-label">Profile Picture</label>
              {profile?.profile_picture && <img src={`${SERVER_URL}${profile.profile_picture}`} alt="Profile" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginBottom: 8, display: 'block' }} />}
              <input className="form-input" type="file" accept="image/*" onChange={setFile('profile_picture')} />
            </div>
            <div className="form-group">
              <label className="form-label">Valid ID *</label>
              {profile?.valid_id && <a href={`${SERVER_URL}${profile.valid_id}`} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--primary)' }}>View current ID</a>}
              <input className="form-input" type="file" accept="image/*,.pdf" onChange={setFile('valid_id')} />
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
    </div>
  );
}
