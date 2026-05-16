import { X, LogOut } from 'lucide-react';

export default function LogoutConfirm({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="modal-header">
          <h3>Sign Out</h3>
          <button className="modal-close" onClick={onCancel}><X size={20} /></button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
          Are you sure you want to sign out of E-Barangay Tinurik?
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>
            <LogOut size={15} /> Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}