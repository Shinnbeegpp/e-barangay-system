import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', password: '', role: 'staff' });
  const [loading, setLoading] = useState(false);

  const load = () => api.get('/staff/accounts').then(r => setAccounts(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.post('/staff/accounts', form);
      toast.success('Account created successfully');
      setShowModal(false);
      setForm({ email: '', first_name: '', last_name: '', password: '', role: 'staff' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating account');
    } finally { setLoading(false); }
  };

  const handleToggle = async (id) => {
    try {
      await api.put(`/staff/accounts/${id}/toggle`);
      load();
      toast.success('Account status updated');
    } catch { toast.error('Error toggling account'); }
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      <div className="page-header">
        <div><h2>Administrator Accounts</h2><p>Manage staff and admin system accounts</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Account</button>
      </div>

      <div className="card">
        {accounts.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}><p>No staff accounts found.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
              <tbody>
                {accounts.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.first_name} {a.last_name}</td>
                    <td style={{ fontSize: 13 }}>{a.email}</td>
                    <td>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: 11, background: a.role === 'admin' ? '#fef3c7' : '#dbeafe', color: a.role === 'admin' ? '#92400e' : '#1e40af', textTransform: 'capitalize' }}>
                        {a.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: 11, background: a.is_active ? '#d1fae5' : '#fee2e2', color: a.is_active ? '#065f46' : '#991b1b' }}>
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(a.created_at), 'MMM d, yyyy')}</td>
                    <td>
                      <button className={`btn btn-sm ${a.is_active ? 'btn-danger' : 'btn-success'}`} onClick={() => handleToggle(a.id)}>
                        {a.is_active ? <><ToggleLeft size={13} /> Deactivate</> : <><ToggleRight size={13} /> Activate</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>🛡️ Create Staff/Admin Account</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-input" value={form.first_name} onChange={set('first_name')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className="form-input" value={form.last_name} onChange={set('last_name')} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" value={form.email} onChange={set('email')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-select" value={form.role} onChange={set('role')}>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
