import { useState } from 'react';
import { Select } from '../components/Field';
import { Empty } from '../components/Async';
import TrendChart from './TrendChart';

/** data: [{ exercise_id, exercise_name, points: [{ date, max_weight_kg }] }] with an exercise selector. */
export default function StrengthChart({ data = [], height = 260 }) {
  const [id, setId] = useState('');
  const withPoints = data.filter((d) => d.points?.length);
  if (!withPoints.length) return <Empty text="Finish a workout to see strength progress" />;
  const current = withPoints.find((d) => String(d.exercise_id) === String(id)) || withPoints[0];
  return (
    <div>
      <div className="mb-3 max-w-xs">
        <Select value={current.exercise_id} onChange={(e) => setId(e.target.value)}
          options={withPoints.map((d) => ({ value: d.exercise_id, label: d.exercise_name }))} />
      </div>
      <TrendChart data={current.points} series={[{ key: 'max_weight_kg', name: 'Max weight', unit: 'kg' }]} height={height} unit="kg" />
    </div>
  );
}
