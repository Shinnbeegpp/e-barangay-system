import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Save, Lock, Mail } from 'lucide-react';

export default function ResidentSettings() {
  const { user } = useAuth();
  const [emailForm, setEmailForm] = useState({ email: user?.email || '', current_password: '' });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/profile/settings', emailForm);
      toast.success('Email updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating email');
    } finally { setLoading(false); }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) return toast.error('New passwords do not match');
    if (pwForm.new_password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.put('/profile/settings', { current_password: pwForm.current_password, new_password: pwForm.new_password });
      toast.success('Password updated successfully');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating password');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header"><div><h2>Account Settings</h2><p>Manage your login credentials</p></div></div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Mail size={18} color="var(--primary)" /><h3 style={{ fontWeight: 700 }}>Update Email Address</h3>
        </div>
        <form onSubmit={handleEmailUpdate}>
          <div className="form-group">
            <label className="form-label">New Email Address</label>
            <input className="form-input" type="email" value={emailForm.email}
              onChange={e => setEmailForm({ ...emailForm, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Current Password (to confirm)</label>
            <input className="form-input" type="password" placeholder="Enter current password"
              value={emailForm.current_password} onChange={e => setEmailForm({ ...emailForm, current_password: e.target.value })} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}><Save size={15} /> Save Email</button>
        </form>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Lock size={18} color="var(--primary)" /><h3 style={{ fontWeight: 700 }}>Change Password</h3>
        </div>
        <form onSubmit={handlePasswordUpdate}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-input" type="password" value={pwForm.current_password}
              onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" placeholder="At least 8 characters" value={pwForm.new_password}
              onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input className="form-input" type="password" value={pwForm.confirm_password}
              onChange={e => setPwForm({ ...pwForm, confirm_password: e.target.value })} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}><Lock size={15} /> Update Password</button>
        </form>
      </div>
    </div>
  );
}
