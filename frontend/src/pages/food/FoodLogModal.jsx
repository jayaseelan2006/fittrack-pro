import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Modal from '../../components/Modal';
import { Field, FormError, Input, Select } from '../../components/Field';
import { Spinner } from '../../components/Async';
import FoodFormModal from './FoodFormModal';
import useDebounce from '../../hooks/useDebounce';
import { foodLogsApi, foodsApi } from '../../services';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FOOD_CATEGORIES, MEAL_TYPES, calcMacros, num } from '../../utils/format';

/** Add a food to a meal (or edit an existing log entry). Macros are previewed live; the backend recalculates authoritatively. */
export default function FoodLogModal({ date, meal, editing, onClose, onSaved }) {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const dq = useDebounce(q, 300);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(!editing);
  const [selected, setSelected] = useState(editing ? { id: editing.food_id, name: editing.food_name } : null);
  const [grams, setGrams] = useState(editing ? editing.quantity_grams : 100);
  const [mealType, setMealType] = useState(editing ? editing.meal_type : meal);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (editing) return undefined;
    let dead = false;
    setLoading(true);
    const req = dq.trim() ? foodsApi.search(dq.trim()) : foodsApi.list(category ? { category } : undefined);
    req.then((r) => { if (!dead) setFoods(category ? r.filter((f) => f.category === category) : r); })
      .catch((e) => { if (!dead) setError(errorMessage(e)); })
      .finally(() => { if (!dead) setLoading(false); });
    return () => { dead = true; };
  }, [dq, category, editing]);

  const preview = selected?.calories_per_100g != null ? calcMacros(selected, grams) : editing ? editing : null;

  const submit = async () => {
    setError('');
    const qty = Number(grams);
    if (!selected) return setError('Pick a food first.');
    if (!(qty > 0) || qty > 5000) return setError('Quantity must be between 1 and 5000 grams.');
    setBusy(true);
    try {
      if (editing) await foodLogsApi.update(editing.id, { meal_type: mealType, quantity_grams: qty, log_date: date });
      else await foodLogsApi.create({ food_id: selected.id, log_date: date, meal_type: mealType, quantity_grams: qty });
      toast.success(editing ? 'Entry updated' : 'Food logged');
      onSaved();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={editing ? `Edit ${editing.food_name}` : 'Add food'} onClose={onClose} onSubmit={submit} busy={busy} submitText={editing ? 'Save changes' : 'Add to log'} size="lg">
      <div className="space-y-4">
        <FormError message={error} />

        {!editing && (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input className="input pl-9" placeholder="Search foods…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
              </div>
              <div className="sm:w-48"><Select value={category} onChange={(e) => setCategory(e.target.value)} placeholder="All categories" options={FOOD_CATEGORIES} /></div>
            </div>

            <div className="max-h-56 overflow-y-auto rounded-xl border border-line">
              {loading ? <div className="flex h-24 items-center justify-center"><Spinner /></div>
                : foods.length === 0 ? <p className="p-5 text-center text-sm text-muted">No foods found.</p>
                : foods.map((f) => (
                  <button type="button" key={f.id} onClick={() => setSelected(f)}
                    className={`flex w-full items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-left text-sm last:border-0 hover:bg-surface2 ${selected?.id === f.id ? 'bg-accent/10' : ''}`}>
                    <span><span className="font-medium">{f.name}</span> <span className="text-xs text-muted">· {f.category}</span></span>
                    <span className="shrink-0 text-xs text-muted">{num(f.calories_per_100g)} kcal · {num(f.protein_per_100g, 1)}p / 100 g</span>
                  </button>
                ))}
            </div>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setCreating(true)}><Plus className="h-3.5 w-3.5" /> Create custom food</button>
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quantity (grams)"><Input type="number" min="1" max="5000" step="1" required value={grams} onChange={(e) => setGrams(e.target.value)} /></Field>
          <Field label="Meal"><Select value={mealType} onChange={(e) => setMealType(e.target.value)} options={MEAL_TYPES} /></Field>
        </div>

        {selected && (
          <div className="grid grid-cols-4 gap-2 rounded-xl border border-accent/30 bg-accent/5 p-3 text-center">
            <div className="col-span-4 text-left text-sm font-semibold">{selected.name}</div>
            {[['Calories', preview?.calories, 'kcal', 0], ['Protein', preview?.protein, 'g', 1], ['Carbs', preview?.carbs, 'g', 1], ['Fat', preview?.fat, 'g', 1]].map(([l, v, u, dg]) => (
              <div key={l}><div className="text-lg font-bold">{num(v, dg)}</div><div className="text-[11px] uppercase text-muted">{l} {u}</div></div>
            ))}
          </div>
        )}
      </div>

      {creating && <FoodFormModal onClose={() => setCreating(false)} onSaved={(f) => { setCreating(false); setSelected(f); setFoods((l) => [f, ...l]); }} />}
    </Modal>
  );
}
