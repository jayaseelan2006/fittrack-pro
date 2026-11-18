import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const push = useCallback((type, message) => {
    const id = Math.random();
    setItems((list) => [...list, { id, type, message }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), 4200);
  }, []);

  const api = useMemo(() => ({ success: (m) => push('success', m), error: (m) => push('error', m) }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {items.map((t) => (
          <div key={t.id} role="status"
            className={`pointer-events-auto flex max-w-sm animate-slide-up items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
              t.type === 'success' ? 'border-accent/40 bg-surface text-ink' : 'border-danger/40 bg-surface text-ink'}`}>
            {t.type === 'success'
              ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
