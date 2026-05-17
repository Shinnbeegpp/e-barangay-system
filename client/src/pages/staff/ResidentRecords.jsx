import { useState, useEffect } from 'react';
import api, { fileUrl } from '../../api/axios';
import { Search, X } from 'lucide-react';
import { format } from 'date-fns';

export default function ResidentRecords() {
  const [residents, setResidents] = useState([]);
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    api.get('/staff/residents').then(r => setResidents(r.data)).catch(() => {});
  }, []);

  const filtered = residents.filter(r =>
    `${r.first_name} ${r.last_name} ${r.email} ${r.mobile_number}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div><h2>Resident Records</h2><p>Database of all verified barangay residents</p></div>
        <span style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '4px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
          {residents.length} Verified Residents
        </span>
      </div>

      <div className="card">
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search by name, email, or phone..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}><p>No residents found.</p></div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Resident</th><th>Contact</th><th>Address</th><th>Civil Status</th><th>DOB</th><th>Registered</th></tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} onClick={() => setViewing(r)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {r.profile_picture
                          ? <img src={fileUrl(r.profile_picture)} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                          : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                        }
                        <div>
                          <div style={{ fontWeight: 600 }}>{r.first_name} {r.middle_name ? r.middle_name[0] + '. ' : ''}{r.last_name} {r.suffix || ''}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{r.mobile_number || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {r.house_number ? `${r.house_number} ${r.street_purok_sitio}, Tinurik` : '—'}
                    </td>
                    <td style={{ fontSize: 13 }}>{r.civil_status || '—'}</td>
                    <td style={{ fontSize: 12 }}>
                      {r.date_of_birth ? `${format(new Date(r.date_of_birth), 'MMM d, yyyy')} (${r.age} yrs)` : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(r.created_at), 'MMM d, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {viewing && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h3>👤 Resident Profile</h3>
              <button className="modal-close" onClick={() => setViewing(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              {viewing.profile_picture
                ? <img src={fileUrl(viewing.profile_picture)} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border)' }} />
                : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>👤</div>
              }
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{viewing.first_name} {viewing.middle_name || ''} {viewing.last_name} {viewing.suffix || ''}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{viewing.email}</div>
                <span style={{ fontSize: 11, background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>Verified Resident</span>
              </div>
            </div>
            {[
              ['Gender', viewing.gender],
              ['Civil Status', viewing.civil_status],
              ['Date of Birth', viewing.date_of_birth ? format(new Date(viewing.date_of_birth), 'MMMM d, yyyy') : null],
              ['Age', viewing.age ? `${viewing.age} years old` : null],
              ['Nationality', viewing.nationality],
              ['Religion', viewing.religion],
              ['Mobile Number', viewing.mobile_number],
              ['Emergency Contact', viewing.emergency_contact_person],
              ['Emergency Number', viewing.emergency_contact_number],
              ['House No.', viewing.house_number],
              ['Street/Purok/Sitio', viewing.street_purok_sitio],
              ['Barangay', 'Tinurik'],
              ['Municipality', 'Tanauan City'],
              ['ZIP Code', '4232'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '7px 0', gap: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', minWidth: 160 }}>{label}</span>
                <span style={{ fontSize: 13 }}>{value || '—'}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-outline" onClick={() => setViewing(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
