import { Trash2 } from 'lucide-react';
import Card from '../../components/Card';
import Async from '../../components/Async';
import useConfirm from '../../components/useConfirm';
import useFetch from '../../hooks/useFetch';
import { workoutLogsApi } from '../../services';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { fmtDateLong, num } from '../../utils/format';

/** Per-exercise session summaries (created automatically when a workout is finished). */
export default function ExerciseLogTab() {
  const toast = useToast();
  const [confirm, dialog] = useConfirm();
  const logs = useFetch(() => workoutLogsApi.list());

  const remove = async (l) => {
    if (!(await confirm(`Delete the ${l.exercise_name} log from ${fmtDateLong(l.log_date)}? This changes your progression history.`))) return;
    try { await workoutLogsApi.remove(l.id); toast.success('Log deleted'); logs.reload(); } catch (e) { toast.error(errorMessage(e)); }
  };

  return (
    <Card pad={false}>
      <Async state={logs} empty={(d) => !d.length} emptyText="Finish a workout and your exercise logs will appear here">
        {(rows) => (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Date</th><th>Exercise</th><th className="text-right">Sets</th><th className="text-right">Reps</th><th className="text-right">Max kg</th><th className="text-right">Volume</th><th /></tr></thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id}>
                    <td className="whitespace-nowrap">{fmtDateLong(l.log_date)}</td>
                    <td className="font-medium">{l.exercise_name}</td>
                    <td className="text-right">{l.total_sets}</td>
                    <td className="text-right">{l.total_reps}</td>
                    <td className="text-right">{num(l.max_weight_kg, 1)}</td>
                    <td className="text-right font-semibold">{num(l.total_volume)}</td>
                    <td className="text-right"><button className="icon-btn hover:text-danger" aria-label="Delete" onClick={() => remove(l)}><Trash2 className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Async>
      {dialog}
    </Card>
  );
}
