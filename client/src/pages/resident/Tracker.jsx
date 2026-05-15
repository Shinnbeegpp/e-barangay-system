import { useEffect, useState } from 'react';
import ResidentLayout from '../../components/ResidentLayout';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import { format } from 'date-fns';

export default function ResidentTracker() {
  const [docs, setDocs] = useState([]);
  const [assist, setAssist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('documents');
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  useEffect(() => {
    Promise.all([api.get('/documents/my'), api.get('/assistance/my')])
      .then(([d, a]) => { setDocs(d.data); setAssist(a.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ResidentLayout title="My Tracker">
      <div className="page-header">
        <div><h2>My Tracker</h2><p>Track the status of your requests and applications</p></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[['documents', '📄 Document Requests'], ['assistance', '🤝 Assistance Applications']].map(([key, label]) => (
          <button key={key} className={`btn ${tab === key ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : tab === 'documents' ? (
        <div className="card">
          {docs.length === 0 ? (
            <div className="empty-state"><h3>No document requests</h3></div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>#</th><th>Document</th><th>Mode</th><th>Status</th><th>Requested</th><th>Notes</th></tr></thead>
                <tbody>
                  {docs.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td><strong>{r.document_type}</strong></td>
                      <td>{r.mode === 'pickup' ? '🏛️ Pick Up' : '📧 Soft Copy'}</td>
                      <td><Badge status={r.status} /></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{format(new Date(r.requested_at), 'MMM d, yyyy')}</td>
                      <td style={{ fontSize: 12 }}>
                        {r.status === 'denied' && <span style={{ color: 'var(--danger)' }}>Reason: {r.denial_reason}</span>}
                        {r.pickup_date && <span style={{ color: 'var(--success)' }}>Pick up: {format(new Date(r.pickup_date), 'MMM d h:mm a')}</span>}
                        {r.soft_copy_url && <a href={`${API_BASE}${r.soft_copy_url}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline">Download</a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          {assist.length === 0 ? (
            <div className="empty-state"><h3>No assistance applications</h3></div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>#</th><th>Program</th><th>Status</th><th>Applied</th><th>Notes</th></tr></thead>
                <tbody>
                  {assist.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td><strong style={{ textTransform: 'capitalize' }}>{r.program_type}</strong></td>
                      <td><Badge status={r.status} /></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{format(new Date(r.applied_at), 'MMM d, yyyy')}</td>
                      <td style={{ fontSize: 12, color: 'var(--danger)' }}>{r.denial_reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </ResidentLayout>
  );
}
