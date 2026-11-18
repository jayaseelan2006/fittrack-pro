import { Dumbbell } from 'lucide-react';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-ink shadow-glow"><Dumbbell className="h-7 w-7" /></span>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="card p-6 shadow-glow">{children}</div>
        {footer && <div className="mt-5 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  );
}
