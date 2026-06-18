export function LoadingState({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="state-card" role="status">
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="state-card empty-state">
      <span className="empty-icon">C</span>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return <div className="alert alert-error" role="alert">{message}</div>;
}
