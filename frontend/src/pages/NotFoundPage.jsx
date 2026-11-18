import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-6xl font-extrabold text-accent">404</p>
      <p className="text-muted">That page doesn't exist.</p>
      <Link to="/" className="btn-primary">Back to dashboard</Link>
    </div>
  );
}
