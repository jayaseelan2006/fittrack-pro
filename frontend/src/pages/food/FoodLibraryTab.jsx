import { useState } from 'react';
import { Copy, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import Card from '../../components/Card';
import Async from '../../components/Async';
import { Select } from '../../components/Field';
import useConfirm from '../../components/useConfirm';
import FoodFormModal from './FoodFormModal';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import { foodsApi } from '../../services';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FOOD_CATEGORIES, num } from '../../utils/format';

export default function FoodLibraryTab() {
  const toast = useToast();
  const [confirm, dialog] = useConfirm();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const dq = useDebounce(q, 300);
  const [modal, setModal] = useState(null); // { food } | { copyFrom } | {}

 const foods = useFetch(
  async () => {
    return await foodsApi.list({
      q: dq.trim() || undefined,
      category: category || undefined,
    });
  },
  [dq, category],
);

  const remove = async (f) => {
    if (!(await confirm(`Delete custom food "${f.name}"? Past food-log entries keep their saved nutrition.`))) return;
    try { await foodsApi.remove(f.id); toast.success('Food deleted'); foods.reload(); } catch (e) { toast.error(errorMessage(e)); }
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Search foods…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="sm:w-52"><Select value={category} onChange={(e) => setCategory(e.target.value)} placeholder="All categories" options={FOOD_CATEGORIES} /></div>
        <button className="btn-primary" onClick={() => setModal({})}><Plus className="h-4 w-4" /> Custom food</button>
      </div>

      <Card pad={false}>
        <Async state={foods} empty={(d) => !d.length} emptyText="No foods match your search">
          {(rows) => (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Food</th><th>Category</th><th className="text-right">Kcal</th><th className="text-right">Protein</th><th className="text-right">Carbs</th><th className="text-right">Fat</th><th /></tr></thead>
                <tbody>
                  {rows.map((f) => (
                    <tr key={f.id}>
                      <td className="font-medium">{f.name} {f.is_custom && <span className="badge ml-1 border-accent/40 text-accent">Custom</span>}</td>
                      <td className="text-muted">{f.category}</td>
                      <td className="text-right">{num(f.calories_per_100g)}</td>
                      <td className="text-right">{num(f.protein_per_100g, 1)}</td>
                      <td className="text-right">{num(f.carbs_per_100g, 1)}</td>
                      <td className="text-right">{num(f.fat_per_100g, 1)}</td>
                      <td className="whitespace-nowrap text-right">
                        {f.is_custom ? (
                          <>
                            <button className="icon-btn" aria-label="Edit" onClick={() => setModal({ food: f })}><Pencil className="h-4 w-4" /></button>
                            <button className="icon-btn hover:text-danger" aria-label="Delete" onClick={() => remove(f)}><Trash2 className="h-4 w-4" /></button>
                          </>
                        ) : (
                          <button className="btn-ghost btn-sm" onClick={() => setModal({ copyFrom: f })}><Copy className="h-3.5 w-3.5" /> Customize</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-line px-4 py-3 text-xs text-muted">All values are per 100 g.</p>
            </div>
          )}
        </Async>
      </Card>

      {modal && <FoodFormModal food={modal.food} copyFrom={modal.copyFrom} onClose={() => setModal(null)} onSaved={() => { setModal(null); foods.reload(); }} />}
      {dialog}
    </>
  );
}
