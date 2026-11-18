export default function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={`mb-6 flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1 ${className}`} role="tablist">
      {tabs.map((t) => (
        <button key={t.key} role="tab" aria-selected={value === t.key} onClick={() => onChange(t.key)}
          className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
            value === t.key ? 'bg-accent text-accent-ink' : 'text-muted hover:text-ink'}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
