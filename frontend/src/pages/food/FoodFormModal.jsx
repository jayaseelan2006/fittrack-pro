import { useState } from 'react';
import Modal from '../../components/Modal';
import { Field, FormError, Input, Select } from '../../components/Field';
import { foodsApi } from '../../services';
import { errorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FOOD_CATEGORIES } from '../../utils/format';

const blank = { name: '', category: 'Other', calories_per_100g: '', protein_per_100g: '', carbs_per_100g: '', fat_per_100g: '' };

/** Create a custom food, edit one, or (copyFrom) customize a built-in food's nutrition values. */
export default function FoodFormModal({ food, copyFrom, onClose, onSaved }) {
  const toast = useToast();
  const editing = !!food;
  const src = food || (copyFrom ? { ...copyFrom, name: `${copyFrom.name} (custom)` } : blank);
  const [form, setForm] = useState({
    name: src.name, category: src.category,
    calories_per_100g: src.calories_per_100g ?? '', protein_per_100g: src.protein_per_100g ?? '',
    carbs_per_100g: src.carbs_per_100g ?? '', fat_per_100g: src.fat_per_100g ?? '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setError('');
    const body = {
      name: form.name.trim(), category: form.category,
      calories_per_100g: Number(form.calories_per_100g), protein_per_100g: Number(form.protein_per_100g),
      carbs_per_100g: Number(form.carbs_per_100g), fat_per_100g: Number(form.fat_per_100g),
    };
    if (!body.name) return setError('Name is required.');
    const nums = [body.calories_per_100g, body.protein_per_100g, body.carbs_per_100g, body.fat_per_100g];
    if (nums.some((n) => Number.isNaN(n) || n < 0)) return setError('Nutrition values must be numbers of 0 or more.');
    if (body.calories_per_100g > 900) return setError('Calories per 100 g cannot exceed 900.');
    if (body.protein_per_100g + body.carbs_per_100g + body.fat_per_100g > 100) return setError('Protein + carbs + fat cannot exceed 100 g per 100 g.');
    setBusy(true);
    try {
      const saved = editing ? await foodsApi.update(food.id, body) : await foodsApi.create(body);
      toast.success(editing ? 'Food updated' : 'Food saved');
      onSaved(saved);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={editing ? 'Edit food' : copyFrom ? 'Customize food' : 'New custom food'} onClose={onClose} onSubmit={submit} busy={busy}>
      <div className="space-y-4">
        <FormError message={error} />
        {copyFrom && <p className="text-xs text-muted">Built-in foods can't be changed, so this saves your own copy with your values.</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><Input required maxLength={150} value={form.name} onChange={set('name')} /></Field>
          <Field label="Category"><Select value={form.category} onChange={set('category')} options={FOOD_CATEGORIES} /></Field>
        </div>
        <p className="label !mb-0">Nutrition per 100 g</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Calories (kcal)"><Input type="number" step="0.1" min="0" required value={form.calories_per_100g} onChange={set('calories_per_100g')} /></Field>
          <Field label="Protein (g)"><Input type="number" step="0.1" min="0" required value={form.protein_per_100g} onChange={set('protein_per_100g')} /></Field>
          <Field label="Carbs (g)"><Input type="number" step="0.1" min="0" required value={form.carbs_per_100g} onChange={set('carbs_per_100g')} /></Field>
          <Field label="Fat (g)"><Input type="number" step="0.1" min="0" required value={form.fat_per_100g} onChange={set('fat_per_100g')} /></Field>
        </div>
      </div>
    </Modal>
  );
}
