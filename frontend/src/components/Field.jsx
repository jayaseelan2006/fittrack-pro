export function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="label">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

export function Input(props) {
  return <input className="input" {...props} />;
}

export function Textarea(props) {
  return <textarea rows={3} className="input resize-none" {...props} />;
}

/** options: array of strings or { value, label } */
export function Select({ options = [], placeholder, ...props }) {
  return (
    <select className="input" {...props}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        return <option key={opt.value} value={opt.value}>{opt.label}</option>;
      })}
    </select>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return <div role="alert" className="rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">{message}</div>;
}
