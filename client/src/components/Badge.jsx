export default function Badge({ status }) {
  const s = status?.toLowerCase().replace(' ', '_') || 'unknown';
  const label = status === 'cancelled' ? 'Cancelled' : status;
  return <span className={`badge badge-${s}`}>{label}</span>;
}