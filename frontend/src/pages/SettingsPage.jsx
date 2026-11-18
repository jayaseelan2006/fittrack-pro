import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2, Moon, Sun } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { Field, FormError, Input, Select } from '../components/Field';
import { usersApi } from '../services';
import { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const TZ = typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : ['UTC'];
const GOALS = [{ value: 'muscle_gain', label: 'Muscle gain' }, { value: 'weight_gain', label: 'Weight gain' }, { value: 'fat_loss', label: 'Fat loss' }, { value: 'maintenance', label: 'Maintenance' }];
const strongPw = (p) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

function ProfileForm() {
  const { user, saveProfile } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [f, setF] = useState({
    full_name: user.full_name || '', gender: user.gender || '', date_of_birth: user.date_of_birth || '', height_cm: user.height_cm ?? '',
    fitness_goal: user.fitness_goal || 'muscle_gain', target_weight_kg: user.target_weight_kg ?? '',
    daily_calorie_target: user.daily_calorie_target ?? 2500, daily_protein_target: user.daily_protein_target ?? 150,
    timezone: user.timezone || 'UTC',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const num = (v) => (v === '' ? null : Number(v));
    const h = num(f.height_cm); const tw = num(f.target_weight_kg);
    const cal = Number(f.daily_calorie_target); const pro = Number(f.daily_protein_target);
    if (!f.full_name.trim()) return setError('Name is required.');
    if (h != null && !(h >= 80 && h <= 260)) return setError('Height must be between 80 and 260 cm.');
    if (tw != null && !(tw >= 20 && tw <= 400)) return setError('Target weight must be between 20 and 400 kg.');
    if (!(cal >= 800 && cal <= 10000)) return setError('Daily calories must be between 800 and 10,000.');
    if (!(pro >= 20 && pro <= 600)) return setError('Daily protein must be between 20 and 600 g.');
    setBusy(true);
    try {
      await saveProfile({
        full_name: f.full_name.trim(), gender: f.gender || null, date_of_birth: f.date_of_birth || null, height_cm: h,
        fitness_goal: f.fitness_goal, target_weight_kg: tw, daily_calorie_target: cal, daily_protein_target: pro, timezone: f.timezone,
      });
      toast.success('Settings saved');
    } catch (ex) { setError(errorMessage(ex)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit}>
      {location.state?.welcome && <div className="mb-4 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm">🎉 Welcome to FitTrack Pro! Set your height, goal and daily targets so your dashboard is accurate.</div>}
      <Card title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><Input required maxLength={120} value={f.full_name} onChange={set('full_name')} /></Field>
          <Field label="Email"><Input value={user.email} disabled /></Field>
          <Field label="Gender"><Select value={f.gender} onChange={set('gender')} placeholder="Prefer not to say" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} /></Field>
          <Field label="Date of birth"><Input type="date" value={f.date_of_birth} onChange={set('date_of_birth')} /></Field>
          <Field label="Height (cm)" hint="Used to calculate BMI"><Input type="number" step="0.1" min="80" max="260" value={f.height_cm} onChange={set('height_cm')} /></Field>
          <Field label="Time zone" hint="Decides when your day starts and ends"><Select value={f.timezone} onChange={set('timezone')} options={TZ.includes(f.timezone) ? TZ : [f.timezone, ...TZ]} /></Field>
        </div>
      </Card>
      <Card title="Fitness goal & targets" className="mt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fitness goal"><Select value={f.fitness_goal} onChange={set('fitness_goal')} options={GOALS} /></Field>
          <Field label="Target weight (kg)"><Input type="number" step="0.1" min="20" max="400" value={f.target_weight_kg} onChange={set('target_weight_kg')} /></Field>
          <Field label="Daily calories (kcal)"><Input type="number" min="800" max="10000" required value={f.daily_calorie_target} onChange={set('daily_calorie_target')} /></Field>
          <Field label="Daily protein (g)"><Input type="number" min="20" max="600" required value={f.daily_protein_target} onChange={set('daily_protein_target')} /></Field>
        </div>
      </Card>
      {error && <div className="mt-4"><FormError message={error} /></div>}
      <div className="mt-4 flex justify-end"><button className="btn-primary" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Save changes</button></div>
    </form>
  );
}

function Appearance() {
  const { user, saveProfile } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const choose = async (theme) => {
    if (theme === user.theme || busy) return;
    setBusy(true);
    try { await saveProfile({ theme }); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
  };
  const Opt = ({ value, icon: Icon, label }) => (
    <button type="button" onClick={() => choose(value)} aria-pressed={user.theme === value}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${user.theme === value ? 'border-accent bg-accent/10 text-accent' : 'border-line text-muted hover:text-ink'}`}><Icon className="h-4 w-4" />{label}</button>
  );
  return (
    <Card title="Theme" className="mt-4">
      <div className="flex max-w-sm gap-3"><Opt value="dark" icon={Moon} label="Dark" /><Opt value="light" icon={Sun} label="Light" /></div>
    </Card>
  );
}

function PasswordForm() {
  const toast = useToast();
  const [f, setF] = useState({ current_password: '', new_password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!strongPw(f.new_password)) return setError('New password must be at least 8 characters with a letter and a number.');
    if (f.new_password !== f.confirm) return setError('New passwords do not match.');
    setBusy(true);
    try {
      await usersApi.changePassword({ current_password: f.current_password, new_password: f.new_password });
      toast.success('Password changed');
      setF({ current_password: '', new_password: '', confirm: '' });
    } catch (ex) { setError(errorMessage(ex)); } finally { setBusy(false); }
  };

  return (
    <Card title="Change password" className="mt-4">
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Current password"><Input type="password" required autoComplete="current-password" value={f.current_password} onChange={(e) => setF({ ...f, current_password: e.target.value })} /></Field>
          <Field label="New password"><Input type="password" required autoComplete="new-password" value={f.new_password} onChange={(e) => setF({ ...f, new_password: e.target.value })} /></Field>
          <Field label="Confirm new password"><Input type="password" required autoComplete="new-password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} /></Field>
        </div>
        <div className="flex justify-end"><button className="btn-ghost" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Update password</button></div>
      </form>
    </Card>
  );
}

function DeleteAccount() {
  const { logout } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    if (confirmText !== 'DELETE') return setError('Type DELETE to confirm.');
    setBusy(true);
    try {
      await usersApi.deleteAccount({ password });
      toast.success('Your account was deleted');
      await logout();
    } catch (ex) { setError(errorMessage(ex)); setBusy(false); }
  };

  return (
    <Card title="Account" className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm"><p className="font-semibold">Delete account</p><p className="text-muted">Permanently removes your profile, logs, workouts and photos. This cannot be undone.</p></div>
        <button className="btn-danger" onClick={() => setOpen(true)}>Delete account</button>
      </div>
      {open && (
        <Modal title="Delete your account?" size="sm" onClose={() => setOpen(false)} onSubmit={submit} busy={busy} submitText="Permanently delete">
          <div className="space-y-4">
            <FormError message={error} />
            <Field label="Your password"><Input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
            <Field label="Type DELETE to confirm"><Input required value={confirmText} onChange={(e) => setConfirmText(e.target.value)} /></Field>
          </div>
        </Modal>
      )}
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Your profile, targets and account" />
      <div className="max-w-4xl">
        <ProfileForm />
        <Appearance />
        <PasswordForm />
        <DeleteAccount />
      </div>
    </>
  );
}
