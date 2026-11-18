import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { photosApi } from '../services';
import { Spinner } from './Async';

/** Loads a private progress photo with the JWT and renders it from an object URL. */
export default function AuthImage({ id, alt = 'Progress photo', className = '' }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let url; let dead = false;
    setSrc(null); setFailed(false);
    photosApi.file(id)
      .then((blob) => { if (!dead) { url = URL.createObjectURL(blob); setSrc(url); } })
      .catch(() => { if (!dead) setFailed(true); });
    return () => { dead = true; if (url) URL.revokeObjectURL(url); };
  }, [id]);

  if (failed) return <div className={`flex items-center justify-center bg-surface2 text-muted ${className}`}><ImageOff className="h-6 w-6" /></div>;
  if (!src) return <div className={`flex items-center justify-center bg-surface2 ${className}`}><Spinner /></div>;
  return <img src={src} alt={alt} className={className} />;
}
