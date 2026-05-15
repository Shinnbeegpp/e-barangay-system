import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) return toast.error('Passwords do not match');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: 52 }}>🏛️</div>
          <h1>Create Account</h1>
          <p>E-Barangay Tinurik · Resident Registration</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-input" placeholder="Juan" value={form.first_name} onChange={set('first_name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-input" placeholder="Dela Cruz" value={form.last_name} onChange={set('last_name')} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="At least 8 characters" value={form.password} onChange={set('password')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" placeholder="Repeat password" value={form.confirm_password} onChange={set('confirm_password')} required />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            <UserPlus size={16} /> {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
