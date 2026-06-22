export default function EmptyState({ icon = "📋", title, subtitle }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: "2rem" }}>{icon}</div>
      <p className="mb-0 fw-semibold">{title}</p>
      {subtitle && <p className="small mb-0">{subtitle}</p>}
    </div>
  );
}
