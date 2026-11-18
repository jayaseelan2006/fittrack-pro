import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AuthShell from '../layouts/AuthShell';
import { Field, FormError, Input } from '../components/Field';
import { authApi } from '../services';
import { errorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ token: params.get('token') || '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) return setError('Password must contain at least one letter and one number.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setBusy(true);
    try {
      await authApi.resetPassword({ token: form.token.trim(), new_password: form.password });
      toast.success('Password updated. You can log in now.');
      navigate('/login', { replace: true });
    } catch (ex) {
      setError(errorMessage(ex));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle="Choose a new password"
      footer={<Link to="/login" className="font-semibold text-accent hover:underline">Back to log in</Link>}>
      <form onSubmit={submit} className="space-y-4">
        <FormError message={error} />
        {!params.get('token') && <Field label="Reset token"><Input required value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} /></Field>}
        <Field label="New password"><Input type="password" required autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <Field label="Confirm new password"><Input type="password" required autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} /></Field>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Update password</button>
      </form>
    </AuthShell>
  );
}
