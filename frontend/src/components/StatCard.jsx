import ProgressBar from './ProgressBar';

export default function StatCard({ icon: Icon, label, value, sub, progress, tone, className = '' }) {
  return (
    <div className={`card animate-fade-in p-4 transition hover:border-accent/40 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
        {Icon && <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent"><Icon className="h-4 w-4" /></span>}
      </div>
      <div className="text-2xl font-bold leading-none tracking-tight">{value}</div>
      {sub && <div className="mt-2 text-xs text-muted">{sub}</div>}
      {progress !== undefined && <ProgressBar value={progress} tone={tone} className="mt-3" />}
    </div>
  );
}
