import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import FoodLogTab from './food/FoodLogTab';
import FoodLibraryTab from './food/FoodLibraryTab';
import FoodHistoryTab from './food/FoodHistoryTab';
import { todayISO } from '../utils/format';

export default function FoodPage() {
  const [tab, setTab] = useState('log');
  const [date, setDate] = useState(todayISO());

  return (
    <>
      <PageHeader title="Food Tracking" subtitle="Log meals and hit your calorie and protein targets" />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'log', label: 'Food Log' }, { key: 'library', label: 'Food Library' }, { key: 'history', label: 'History & Reports' }]} />
      {tab === 'log' && <FoodLogTab date={date} setDate={setDate} />}
      {tab === 'library' && <FoodLibraryTab />}
      {tab === 'history' && <FoodHistoryTab onPickDate={(d) => { setDate(d); setTab('log'); }} />}
    </>
  );
}
