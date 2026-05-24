import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Megaphone, Plus, Trash2, Edit, X, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', is_active: true });
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => api.get('/announcements/all').then(r => setAnnouncements(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ title: '', content: '', is_active: true }); setShowModal(true); };
  const openEdit = (a) => { setEditing(a); setForm({ title: a.title, content: a.content, is_active: a.is_active }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editing) {
        await api.put(`/announcements/${editing.id}`, form);
        toast.success('Announcement updated');
      } else {
        await api.post('/announcements', form);
        toast.success('Announcement published');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving announcement');
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/announcements/${confirmDelete}`);
      toast.success('Announcement deleted');
      setConfirmDelete(null);
      load();
    } catch { toast.error('Error deleting'); }
  };

  const toggleActive = async (a) => {
    try {
      await api.put(`/announcements/${a.id}`, { title: a.title, content: a.content, is_active: !a.is_active });
      load();
    } catch { toast.error('Error updating status'); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>Announcements</h2><p>Create and manage barangay announcements for residents</p></div>
        <button className="btn btn-primary" onClick={openNew}><Plus size={16} /> New Announcement</button>
      </div>

      {announcements.length === 0 ? (
        <div className="card"><div className="empty-state"><h3>No Announcements</h3><p>Create your first announcement for residents.</p></div></div>
      ) : (
        <div>
          {announcements.map(a => (
            <div key={a.id} className="announcement-card" style={{ borderLeftColor: a.is_active ? 'var(--primary)' : 'var(--border)', opacity: a.is_active ? 1 : .6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4>{a.title}</h4>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700, background: a.is_active ? '#d1fae5' : '#f1f5f9', color: a.is_active ? '#065f46' : '#475569' }}>
                      {a.is_active ? 'Published' : 'Hidden'}
                    </span>
                  </div>
                  <p>{a.content}</p>
                  <div className="announcement-meta">
                    By {a.first_name} {a.last_name} · {format(new Date(a.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => toggleActive(a)} title={a.is_active ? 'Hide' : 'Publish'}>
                    {a.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}><Edit size={14} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(a.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? '✏️ Edit Announcement' : '📢 New Announcement'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="Announcement title" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea className="form-textarea" style={{ minHeight: 140 }}
                  placeholder="Write your announcement here..."
                  value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                  Publish immediately (visible to all residents)
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  <Megaphone size={15} /> {loading ? 'Saving...' : editing ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <h3>🗑️ Delete Announcement</h3>
              <button className="modal-close" onClick={() => setConfirmDelete(null)}><X size={20} /></button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
