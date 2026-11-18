import { useRef, useState } from 'react';
import { GitCompare, Loader2, Trash2, Upload } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Async from '../components/Async';
import AuthImage from '../components/AuthImage';
import Modal from '../components/Modal';
import { Field, FormError, Input, Select } from '../components/Field';
import useConfirm from '../components/useConfirm';
import useFetch from '../hooks/useFetch';
import { photosApi } from '../services';
import { errorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { fmtDateLong, todayISO } from '../utils/format';

const MAX_MB = 5;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function Compare({ photos, onClose }) {
  const sorted = [...photos].sort((a, b) => a.photo_date.localeCompare(b.photo_date));
  const [before, setBefore] = useState(sorted[0]?.id);
  const [after, setAfter] = useState(sorted[sorted.length - 1]?.id);
  const opts = sorted.map((p) => ({ value: p.id, label: fmtDateLong(p.photo_date) }));
  const pick = (id) => sorted.find((p) => String(p.id) === String(id));
  const Side = ({ title, value, set }) => (
    <div>
      <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wider text-accent">{title}</p>
      <Select value={value} onChange={(e) => set(e.target.value)} options={opts} />
      {pick(value) && <AuthImage key={value} id={pick(value).id} className="mt-3 aspect-[3/4] w-full rounded-xl object-cover" alt={title} />}
    </div>
  );
  return (
    <Modal title="Before & after" onClose={onClose} size="lg">
      <div className="grid grid-cols-2 gap-4"><Side title="Before" value={before} set={setBefore} /><Side title="After" value={after} set={setAfter} /></div>
    </Modal>
  );
}

export default function PhotosPage() {
  const toast = useToast();
  const [confirm, dialog] = useConfirm();
  const photos = useFetch(() => photosApi.list());
  const fileRef = useRef(null);
  const [form, setForm] = useState({ photo_date: todayISO(), notes: '', file: null });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [comparing, setComparing] = useState(false);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    setError('');
    if (!f) return setForm({ ...form, file: null });
    if (!TYPES.includes(f.type)) { e.target.value = ''; return setError('Only JPG, PNG or WebP images are allowed.'); }
    if (f.size > MAX_MB * 1024 * 1024) { e.target.value = ''; return setError(`The image must be smaller than ${MAX_MB} MB.`); }
    return setForm({ ...form, file: f });
  };

  const upload = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.file) return setError('Choose an image to upload.');
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', form.file);
      fd.append('photo_date', form.photo_date);
      if (form.notes.trim()) fd.append('notes', form.notes.trim());
      await photosApi.upload(fd);
      toast.success('Photo uploaded');
      setForm({ photo_date: todayISO(), notes: '', file: null });
      if (fileRef.current) fileRef.current.value = '';
      photos.reload();
    } catch (ex) { setError(errorMessage(ex)); } finally { setBusy(false); }
  };

  const remove = async (p) => {
    if (!(await confirm(`Permanently delete the photo from ${fmtDateLong(p.photo_date)}?`))) return;
    try { await photosApi.remove(p.id); toast.success('Photo deleted'); photos.reload(); } catch (ex) { toast.error(errorMessage(ex)); }
  };

  return (
    <>
      <PageHeader title="Progress Photos" subtitle="Private — only you can see these"
        actions={photos.data?.length >= 2 && <button className="btn-ghost" onClick={() => setComparing(true)}><GitCompare className="h-4 w-4" /> Before & after</button>} />

      <Card title="Upload a photo" className="mb-6">
        <form onSubmit={upload} className="grid items-end gap-4 md:grid-cols-[1fr_12rem_1fr_auto]">
          <Field label={`Image (JPG, PNG, WebP · max ${MAX_MB} MB)`}>
            <input ref={fileRef} type="file" accept={TYPES.join(',')} onChange={onFile} className="input file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-1 file:text-xs file:font-semibold file:text-accent-ink" />
          </Field>
          <Field label="Date"><Input type="date" max={todayISO()} required value={form.photo_date} onChange={(e) => setForm({ ...form, photo_date: e.target.value })} /></Field>
          <Field label="Notes"><Input maxLength={300} placeholder="Optional" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
          <button className="btn-primary" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload</button>
        </form>
        {error && <div className="mt-4"><FormError message={error} /></div>}
      </Card>

      <Async state={photos} empty={(d) => !d.length} emptyText="No photos yet. Upload your first progress photo!">
        {(rows) => {
          const byDate = [...rows].sort((a, b) => b.photo_date.localeCompare(a.photo_date));
          return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {byDate.map((p) => (
                <figure key={p.id} className="card group relative overflow-hidden">
                  <AuthImage id={p.id} className="aspect-[3/4] w-full object-cover" />
                  <figcaption className="p-3 text-xs"><p className="font-semibold">{fmtDateLong(p.photo_date)}</p>{p.notes && <p className="mt-0.5 truncate text-muted">{p.notes}</p>}</figcaption>
                  <button className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white opacity-100 backdrop-blur transition hover:bg-danger sm:opacity-0 sm:group-hover:opacity-100" aria-label="Delete photo" onClick={() => remove(p)}><Trash2 className="h-4 w-4" /></button>
                </figure>
              ))}
            </div>
          );
        }}
      </Async>

      {comparing && photos.data && <Compare photos={photos.data} onClose={() => setComparing(false)} />}
      {dialog}
    </>
  );
}
