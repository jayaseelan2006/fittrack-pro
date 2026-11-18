import { clampPct } from '../utils/format';

export default function ProgressBar({ value = 0, tone = 'accent', className = '' }) {
  const tones = { accent: 'bg-accent', warn: 'bg-warn', danger: 'bg-danger', info: 'bg-info' };
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-surface2 ${className}`} role="progressbar"
      aria-valuenow={Math.round(clampPct(value))} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all duration-700 ${tones[tone]}`} style={{ width: `${clampPct(value)}%` }} />
    </div>
  );
}
