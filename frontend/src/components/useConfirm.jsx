import { useCallback, useState } from 'react';
import Modal from './Modal';

/** const [confirm, dialog] = useConfirm(); if (!(await confirm('Delete?'))) return; ... render {dialog} */
export default function useConfirm() {
  const [state, setState] = useState(null);

  const confirm = useCallback(
    (opts) => new Promise((resolve) => setState({ ...(typeof opts === 'string' ? { message: opts } : opts), resolve })),
    [],
  );
  const close = (v) => { state.resolve(v); setState(null); };

  const dialog = state && (
    <Modal title={state.title || 'Are you sure?'} size="sm" onClose={() => close(false)}
      footer={(
        <>
          <button className="btn-ghost" onClick={() => close(false)}>Cancel</button>
          <button className={state.danger === false ? 'btn-primary' : 'btn-danger'} onClick={() => close(true)}>{state.confirmText || 'Delete'}</button>
        </>
      )}>
      <p className="text-sm text-muted">{state.message}</p>
    </Modal>
  );
  return [confirm, dialog];
}
