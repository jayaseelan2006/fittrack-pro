import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '../services/api';

/** Runs an async loader and tracks { data, loading, error }. Re-runs when deps change or reload() is called. */
export default function useFetch(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    loader()
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((e) => { if (!cancelled) setState({ data: null, loading: false, error: errorMessage(e) }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
