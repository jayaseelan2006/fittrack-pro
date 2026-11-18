export default function Card({ title, action, children, className = '', pad = true }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-5 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
          {action}
        </header>
      )}
      <div className={pad ? 'p-5' : ''}>{children}</div>
    </section>
  );
}
