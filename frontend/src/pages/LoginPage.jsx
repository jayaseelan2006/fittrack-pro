import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthShell from '../layouts/AuthShell';
import { Field, FormError, Input } from '../components/Field';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (ex) {
      setError(errorMessage(ex));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your progress"
      footer={<>New here? <Link to="/register" className="font-semibold text-accent hover:underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        <Field label="Email"><Input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></Field>
        <Field label="Password"><Input type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></Field>
        <div className="text-right"><Link to="/forgot-password" className="text-xs text-muted hover:text-accent">Forgot password?</Link></div>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Log in</button>
      </form>
    </AuthShell>
  );
}
