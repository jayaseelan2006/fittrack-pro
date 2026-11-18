import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import Card from '../../components/Card';
import Async from '../../components/Async';
import ProgressBar from '../../components/ProgressBar';
import useConfirm from '../../components/useConfirm';
import FoodLogModal from './FoodLogModal';
import useFetch from '../../hooks/useFetch';
import { foodLogsApi } from '../../services';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { MEAL_TYPES, addDays, fmtDateLong, num, todayISO, toNum } from '../../utils/format';

function Macro({ label, value, unit, target, remaining }) {
  const pct = target ? (toNum(value) / toNum(target)) * 100 : null;
  return (
    <div className="card p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-2xl font-bold">{num(value, unit === 'g' ? 1 : 0)}<span className="ml-1 text-sm font-medium text-muted">{unit}</span></div>
      {target != null ? (
        <>
          <ProgressBar value={pct} tone={pct > 105 ? 'warn' : 'accent'} className="mt-3" />
          <div className="mt-2 flex justify-between text-xs text-muted">
            <span>Target {num(target)}</span>
            <span className={toNum(remaining) < 0 ? 'text-warn' : 'text-accent'}>{toNum(remaining) < 0 ? `${num(Math.abs(remaining))} over` : `${num(remaining)} left`}</span>
          </div>
        </>
      ) : <div className="mt-2 text-xs text-muted">consumed</div>}
    </div>
  );
}

export default function FoodLogTab({ date, setDate }) {
  const toast = useToast();
  const [confirm, dialog] = useConfirm();
  const daily = useFetch(() => foodLogsApi.daily(date), [date]);
  const logs = useFetch(() => foodLogsApi.list({ date }), [date]);
  const [modal, setModal] = useState(null); // { meal, editing }

  const reload = () => { daily.reload(); logs.reload(); };

  const remove = async (log) => {
    if (!(await confirm(`Remove ${log.food_name} (${log.quantity_grams} g) from your log?`))) return;
    try { await foodLogsApi.remove(log.id); toast.success('Entry removed'); reload(); } catch (e) { toast.error(errorMessage(e)); }
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button className="icon-btn border border-line" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day"><ChevronLeft className="h-4 w-4" /></button>
        <input type="date" className="input !w-auto" value={date} max={todayISO()} onChange={(e) => e.target.value && setDate(e.target.value)} />
        <button className="icon-btn border border-line disabled:opacity-40" disabled={date >= todayISO()} onClick={() => setDate(addDays(date, 1))} aria-label="Next day"><ChevronRight className="h-4 w-4" /></button>
        {date !== todayISO() && <button className="btn-ghost btn-sm" onClick={() => setDate(todayISO())}>Today</button>}
        <span className="ml-1 text-sm text-muted">{fmtDateLong(date)}</span>
      </div>

      <Async state={daily} height="h-32">
        {(d) => (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Macro label="Calories" value={d.calories} unit="kcal" target={d.calorie_target} remaining={d.remaining_calories} />
              <Macro label="Protein" value={d.protein} unit="g" target={d.protein_target} remaining={d.remaining_protein} />
              <Macro label="Carbs" value={d.carbs} unit="g" />
              <Macro label="Fat" value={d.fat} unit="g" />
            </div>
            <p className="mt-2 text-xs text-muted">Targets come from your <Link to="/settings" className="text-accent hover:underline">settings</Link>.</p>
          </>
        )}
      </Async>

      <div className="mt-5 space-y-4">
        <Async state={logs} height="h-40">
          {(rows) => MEAL_TYPES.map((m) => {
            const items = rows.filter((r) => r.meal_type === m.value);
            const kcal = items.reduce((a, r) => a + toNum(r.calories), 0);
            return (
              <Card key={m.value} pad={false}>
                <div className="flex items-center justify-between px-5 py-3.5">
                  <div><h3 className="font-semibold">{m.label}</h3><p className="text-xs text-muted">{num(kcal)} kcal · {items.length} item{items.length === 1 ? '' : 's'}</p></div>
                  <button className="btn-ghost btn-sm" onClick={() => setModal({ meal: m.value })}><Plus className="h-3.5 w-3.5" /> Add food</button>
                </div>
                {items.length > 0 && (
                  <div className="overflow-x-auto border-t border-line">
                    <table className="tbl">
                      <thead><tr><th>Food</th><th className="text-right">Grams</th><th className="text-right">Kcal</th><th className="text-right">Protein</th><th className="text-right">Carbs</th><th className="text-right">Fat</th><th /></tr></thead>
                      <tbody>
                        {items.map((r) => (
                          <tr key={r.id}>
                            <td className="font-medium">{r.food_name}</td>
                            <td className="text-right">{num(r.quantity_grams, 1)}</td>
                            <td className="text-right">{num(r.calories)}</td>
                            <td className="text-right">{num(r.protein, 1)}</td>
                            <td className="text-right">{num(r.carbs, 1)}</td>
                            <td className="text-right">{num(r.fat, 1)}</td>
                            <td className="whitespace-nowrap text-right">
                              <button className="icon-btn" onClick={() => setModal({ meal: m.value, editing: r })} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                              <button className="icon-btn hover:text-danger" onClick={() => remove(r)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            );
          })}
        </Async>
      </div>

      {modal && <FoodLogModal date={date} meal={modal.meal} editing={modal.editing} onClose={() => setModal(null)} onSaved={() => { setModal(null); reload(); }} />}
      {dialog}
    </>
  );
}
