import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Badge from '../../components/Badge';
import { FileText, Heart, AlertTriangle, X, Download, AlertCircle } from 'lucide-react';

import { fileUrl } from '../../api/axios';

import { format } from 'date-fns';

const toLocal = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(d.getTime() + (8 * 60 * 60 * 1000));
};

export default function MyTracker() {
  const [documents, setDocuments] = useState([]);
  const [assistance, setAssistance] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [tab, setTab] = useState('documents');
  const [noteModal, setNoteModal] = useState(null);

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
                        {d.status === 'denied' && d.denial_reason && (
                          <button onClick={() => setNoteModal({ title: 'Denial Reason', text: d.denial_reason, type: 'danger', updated_at: d.updated_at })}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff0f0', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <AlertCircle size={11} /> View Reason
                          </button>
                        )}
                        {d.pickup_date && (
                          <button onClick={() => setNoteModal({ title: 'Pickup Schedule', text: format(toLocal(d.pickup_date), 'MMMM d, yyyy h:mm a'), type: 'success', updated_at: d.updated_at })}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0fff4', color: 'var(--success)', border: '1px solid var(--success)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            📅 Pickup Schedule
                          </button>
                        )}
                        {d.soft_copy_url && (
                          <button
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--primary)', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                            onClick={async () => {
                              const url = fileUrl(d.soft_copy_url);
                              const originalUrl = d.soft_copy_url || '';
                              const isPdf = originalUrl.includes('/raw/') || originalUrl.toLowerCase().includes('.pdf');
                              const ext = isPdf ? '.pdf' : originalUrl.toLowerCase().includes('.png') ? '.png' : '.jpg';
                              const res = await fetch(url);
                              const blob = await res.blob();
                              const link = document.createElement('a');
                              link.href = URL.createObjectURL(blob);
                              link.download = `document_${d.id}${ext}`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}>
                            <Download size={11} /> Download
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
                      <td style={{ fontSize: 12 }}>
                        {a.status === 'denied' && a.denial_reason && (
                          <button onClick={() => setNoteModal({ title: 'Denial Reason', text: a.denial_reason, type: 'danger', updated_at: a.updated_at })}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff0f0', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            <AlertCircle size={11} /> View Reason
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
                      <td style={{ fontSize: 12 }}>
                        {i.staff_notes ? (
                          <button onClick={() => setNoteModal({ title: 'Staff Notes', text: i.staff_notes, type: 'muted', updated_at: i.updated_at })}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                            📋 View Notes
                          </button>
                        ) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {noteModal && (
        <div className="modal-overlay" onClick={() => setNoteModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{noteModal.title}</h3>
              <button className="modal-close" onClick={() => setNoteModal(null)}><X size={20} /></button>
            </div>
            <p style={{ color: noteModal.type === 'danger' ? 'var(--danger)' : noteModal.type === 'success' ? 'var(--success)' : 'var(--text)', lineHeight: 1.7, fontSize: 14, marginBottom: noteModal.updated_at ? 12 : 0 }}>
              {noteModal.text}
            </p>
            {noteModal.updated_at && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                🕐 Updated on {format(toLocal(noteModal.updated_at), 'MMMM d, yyyy h:mm a')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

