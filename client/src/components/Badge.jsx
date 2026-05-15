export default function Badge({ status }) {
  const s = status?.toLowerCase().replace(' ', '_') || 'unknown';
  return <span className={`badge badge-${s}`}>{status}</span>;
}
