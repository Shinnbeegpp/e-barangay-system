import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/staff/logs').then(r => setLogs(r.data)).catch(() => {});
  }, []);

  const filtered = logs.filter(l =>
    `${l.action} ${l.details} ${l.first_name} ${l.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div><h2>Transaction Logs</h2><p>Audit trail of all staff actions and system transactions</p></div>
      </div>

      <div className="card">
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search logs..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}><p>No logs found.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>#</th><th>Action</th><th>Details</th><th>Performed By</th><th>Date & Time</th></tr></thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr key={l.id}>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{l.id}</td>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{l.action}</span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 300 }}>{l.details}</td>
                    <td style={{ fontSize: 13 }}>{l.first_name} {l.last_name}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {format(new Date(l.performed_at), 'MMM d, yyyy h:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
