import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import WorkoutListTab from './workouts/WorkoutListTab';
import ExerciseLibraryTab from './workouts/ExerciseLibraryTab';
import ExerciseLogTab from './workouts/ExerciseLogTab';

export default function WorkoutsPage() {
  const [tab, setTab] = useState('workouts');
  return (
    <>
      <PageHeader title="Workouts" subtitle="Plan, run and review your training" />
      <Tabs value={tab} onChange={setTab} className="max-w-xl" tabs={[{ key: 'workouts', label: 'Workouts' }, { key: 'exercises', label: 'Exercise Library' }, { key: 'log', label: 'Exercise Log' }]} />
      {tab === 'workouts' && <WorkoutListTab />}
      {tab === 'exercises' && <ExerciseLibraryTab />}
      {tab === 'log' && <ExerciseLogTab />}
    </>
  );
}
