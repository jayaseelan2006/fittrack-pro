import { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';

const SIZES = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

export default function Modal({ title, onClose, children, size = 'md', onSubmit, submitText = 'Save', busy = false, footer }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const Body = onSubmit ? 'form' : 'div';
  const bodyProps = onSubmit ? { onSubmit: (e) => { e.preventDefault(); onSubmit(e); } } : {};

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div role="dialog" aria-modal="true" className={`card flex max-h-[92vh] w-full ${SIZES[size]} animate-slide-up flex-col rounded-b-none shadow-glow sm:rounded-b-2xl`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <Body {...bodyProps} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
          {(onSubmit || footer) && (
            <div className="flex justify-end gap-2 border-t border-line p-4">
              {footer ?? (
                <>
                  <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}{submitText}
                  </button>
                </>
              )}
            </div>
          )}
        </Body>
      </div>
    </div>
  );
}
