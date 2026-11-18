import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthShell from '../layouts/AuthShell';
import { Field, FormError, Input } from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) return setError('Password must contain at least one letter and one number.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      await register({ full_name: form.full_name.trim(), email: form.email.trim(), password: form.password });
      navigate('/settings', { replace: true, state: { welcome: true } });
    } catch (ex) {
      setError(errorMessage(ex));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start tracking food, weight and strength"
      footer={<>Already registered? <Link to="/login" className="font-semibold text-accent hover:underline">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <Field label="Full name"><Input required maxLength={120} value={form.full_name} onChange={set('full_name')} placeholder="Alex Carter" /></Field>
        <Field label="Email"><Input type="email" required autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@example.com" /></Field>
        <Field label="Password" hint="At least 8 characters, with a letter and a number"><Input type="password" required autoComplete="new-password" value={form.password} onChange={set('password')} /></Field>
        <Field label="Confirm password"><Input type="password" required autoComplete="new-password" value={form.confirm} onChange={set('confirm')} /></Field>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account</button>
      </form>
    </AuthShell>
  );
}
