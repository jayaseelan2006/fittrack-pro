import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import AuthShell from '../layouts/AuthShell';
import { Field, FormError, Input } from '../components/Field';
import { authApi } from '../services';
import { errorMessage } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      setResult(await authApi.forgotPassword({ email: email.trim() }));
    } catch (ex) {
      setError(errorMessage(ex));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Forgot password" subtitle="We'll help you get back in"
      footer={<Link to="/login" className="font-semibold text-accent hover:underline">Back to log in</Link>}>
      {result ? (
        <div className="space-y-4 text-center">
          <MailCheck className="mx-auto h-10 w-10 text-accent" />
          <p className="text-sm">{result.message || 'If that email is registered, a reset link has been generated.'}</p>
          {/* Only present when the backend runs without an email provider (development). */}
          {result.reset_token && (
            <Link className="btn-ghost w-full" to={`/reset-password?token=${encodeURIComponent(result.reset_token)}`}>Open reset page (dev mode)</Link>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <FormError message={error} />
          <Field label="Email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></Field>
          <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link</button>
        </form>
      )}
    </AuthShell>
  );
}
