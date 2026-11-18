import { useState } from 'react';
import { Search } from 'lucide-react';
import Modal from '../../components/Modal';
import Async from '../../components/Async';
import { Select } from '../../components/Field';
import useFetch from '../../hooks/useFetch';
import { exercisesApi } from '../../services';
import { MUSCLE_GROUPS, cap } from '../../utils/format';

export default function ExercisePicker({ defaultGroup = '', excludeIds = [], onPick, onClose }) {
  const [group, setGroup] = useState(defaultGroup);
  const [q, setQ] = useState('');
  const exercises = useFetch(() => exercisesApi.list(group ? { muscle_group: group } : undefined), [group]);

  return (
    <Modal title="Add exercise" onClose={onClose} size="lg">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="input pl-9" autoFocus placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="sm:w-48"><Select value={group} onChange={(e) => setGroup(e.target.value)} placeholder="All muscle groups" options={MUSCLE_GROUPS.map((m) => ({ value: m, label: cap(m) }))} /></div>
      </div>
      <Async state={exercises} empty={(d) => !d.length} emptyText="No exercises in this group" height="h-40">
        {(rows) => (
          <ul className="max-h-[50vh] divide-y divide-line overflow-y-auto rounded-xl border border-line">
            {rows.filter((r) => r.name.toLowerCase().includes(q.trim().toLowerCase())).map((r) => {
              const used = excludeIds.includes(r.id);
              return (
                <li key={r.id}>
                  <button type="button" disabled={used} onClick={() => onPick(r)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-surface2 disabled:opacity-40">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-xs text-muted">{used ? 'Already added' : `${cap(r.muscle_group)} · ${r.equipment}`}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Async>
    </Modal>
  );
}
