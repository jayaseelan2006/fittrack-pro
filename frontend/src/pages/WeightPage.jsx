import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import WeightTab from './weight/WeightTab';
import MeasurementsTab from './weight/MeasurementsTab';

export default function WeightPage() {
  const [tab, setTab] = useState('weight');
  return (
    <>
      <PageHeader title="Weight & Body" subtitle="Track bodyweight, BMI and measurements over time" />
      <Tabs value={tab} onChange={setTab} className="max-w-sm" tabs={[{ key: 'weight', label: 'Weight' }, { key: 'measurements', label: 'Measurements' }]} />
      {tab === 'weight' ? <WeightTab /> : <MeasurementsTab />}
    </>
  );
}
