import { AlertCircle, Inbox, Loader2, RotateCw } from 'lucide-react';

export function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-accent ${className}`} />;
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger/30 bg-danger/5 p-6 text-center">
      <AlertCircle className="h-6 w-6 text-danger" />
      <p className="text-sm text-ink">{message}</p>
      {onRetry && <button className="btn-ghost btn-sm" onClick={onRetry}><RotateCw className="h-3.5 w-3.5" /> Retry</button>}
    </div>
  );
}

export function Empty({ text = 'Nothing here yet', height = 'h-40', children }) {
  return (
    <div className={`flex ${height} flex-col items-center justify-center gap-2 text-center text-sm text-muted`}>
      <Inbox className="h-6 w-6 opacity-60" />
      <p>{text}</p>
      {children}
    </div>
  );
}

/**
 * Standard loading / error / empty handling for a useFetch() result.
 * children can be a render function receiving the data.
 */
export default function Async({ state, empty, emptyText, height = 'h-52', children }) {
  const { data, loading, error, reload } = state;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (data == null) {
    return loading
      ? <div className={`flex ${height} items-center justify-center`}><Spinner className="h-6 w-6" /></div>
      : null;
  }
  if (empty && empty(data)) return <Empty text={emptyText} height={height} />;
  return (
    <div className={loading ? 'opacity-60 transition-opacity' : ''}>
      {typeof children === 'function' ? children(data) : children}
    </div>
  );
}
