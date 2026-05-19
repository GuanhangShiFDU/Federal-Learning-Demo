export default function MetricCard({ title, value, note }) {
  return (
    <div className="metric-card">
      <p>{title}</p>
      <h3>{value}</h3>
      <span>{note}</span>
    </div>
  );
}