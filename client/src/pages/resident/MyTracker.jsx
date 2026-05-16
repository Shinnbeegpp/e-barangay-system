import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import { FileText, Heart, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { SERVER_URL } from '../../api/axios';

export default function MyTracker() {
  const [documents, setDocuments] = useState([]);
  const [assistance, setAssistance] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [tab, setTab] = useState('documents');

  useEffect(() => {
    api.get('/documents/my').then(r => setDocuments(r.data)).catch(() => {});
    api.get('/assistance/my').then(r => setAssistance(r.data)).catch(() => {});
    api.get('/incidents/my').then(r => setIncidents(r.data)).catch(() => {});
  }, []);

  const tabs = [
    { key: 'documents', label: 'Documents', icon: <FileText size={15} />, count: documents.length },
    { key: 'assistance', label: 'Assistance', icon: <Heart size={15} />, count: assistance.length },
    { key: 'incidents', label: 'Incidents', icon: <AlertTriangle size={15} />, count: incidents.length },
  ];

  return (
    <div>
      <div className="page-header">
        <div><h2>My Tracker</h2><p>Monitor the real-time status of your requests and applications</p></div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: tab === t.key ? 'var(--primary)' : 'var(--text-muted)', borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: -1 }}>
            {t.icon} {t.label}
            <span style={{ background: tab === t.key ? 'var(--primary)' : 'var(--border)', color: tab === t.key ? 'white' : 'var(--text-muted)', fontSize: 11, fontWeight: 700, padding: '1px 6px', borderRadius: 20 }}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'documents' && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Document Request History</h3>
          {documents.length === 0 ? <div className="empty-state" style={{ padding: '30px 0' }}><p>No document requests yet.</p></div> : (
            <div className="table-container">
              <table>
                <thead><tr><th>Document</th><th>Mode</th><th>Status</th><th>Date</th><th>Notes</th></tr></thead>
                <tbody>
                  {documents.map(d => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.document_type}</td>
                      <td>{d.mode === 'soft_copy' ? '💾 Soft Copy' : '🏛️ Pick Up'}</td>
                      <td><Badge status={d.status} /></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(d.requested_at), 'MMM d, yyyy')}</td>
                      <td style={{ fontSize: 12 }}>
                        {d.status === 'denied' && <span style={{ color: 'var(--danger)' }}>Denied: {d.denial_reason}</span>}
                        {d.pickup_date && <span style={{ color: 'var(--success)' }}>Pickup: {format(new Date(d.pickup_date), 'MMM d h:mm a')}</span>}
                        {d.soft_copy_url && <a href={`${SERVER_URL}${d.soft_copy_url}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>📥 Download</a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'assistance' && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Assistance Application History</h3>
          {assistance.length === 0 ? <div className="empty-state" style={{ padding: '30px 0' }}><p>No assistance applications yet.</p></div> : (
            <div className="table-container">
              <table>
                <thead><tr><th>Program</th><th>Status</th><th>Applied</th><th>Notes</th></tr></thead>
                <tbody>
                  {assistance.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{a.program_type} Assistance</td>
                      <td><Badge status={a.status} /></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(a.applied_at), 'MMM d, yyyy')}</td>
                      <td style={{ fontSize: 12, color: 'var(--danger)' }}>{a.status === 'denied' && `Denied: ${a.denial_reason}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'incidents' && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Incident Report History</h3>
          {incidents.length === 0 ? <div className="empty-state" style={{ padding: '30px 0' }}><p>No incident reports yet.</p></div> : (
            <div className="table-container">
              <table>
                <thead><tr><th>Title</th><th>Location</th><th>Status</th><th>Filed</th><th>Staff Notes</th></tr></thead>
                <tbody>
                  {incidents.map(i => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: 600 }}>{i.title}</td>
                      <td style={{ fontSize: 12 }}>{i.location}</td>
                      <td><Badge status={i.status} /></td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(i.reported_at), 'MMM d, yyyy')}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{i.staff_notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
