export const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snacks', label: 'Snacks' },
];
export const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'abs', 'cardio'];
export const FOOD_CATEGORIES = [
  'Breakfast',
  'Rice and Grains',
  'Indian Meals',
  'Protein',
  'Vegetarian Protein',
  'Fruits',
  'Vegetables',
  'Dairy',
  'Nuts and Seeds',
  'International Foods',
  'Snacks',
  'Sweets and Desserts',
];
export const EQUIPMENT = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Smith Machine', 'Bands', 'Other'];

export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '');

const pad = (x) => String(x).padStart(2, '0');
/** Local calendar date (YYYY-MM-DD) – never use toISOString() for dates, it shifts by timezone. */
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());
export const parseISO = (iso) => { const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return toISO(d); };
export const fmtDate = (iso, opts = { day: 'numeric', month: 'short' }) => (iso ? parseISO(iso).toLocaleDateString(undefined, opts) : '–');
export const fmtDateLong = (iso) => fmtDate(iso, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

/** Backend sends naive UTC datetimes; make sure the browser reads them as UTC. */
export const parseServerDate = (s) => (!s ? null : /([zZ]|[+-]\d\d:?\d\d)$/.test(s) ? new Date(s) : new Date(`${s}Z`));

export const num = (v, digits = 0) =>
  v === null || v === undefined || v === '' || Number.isNaN(Number(v))
    ? '–'
    : Number(v).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
export const toNum = (v) => Number(v) || 0;
export const clampPct = (v) => Math.max(0, Math.min(100, Number(v) || 0));
export const signed = (v, digits = 1, unit = '') => {
  const x = Number(v) || 0;
  return `${x > 0 ? '+' : ''}${num(x, digits)}${unit ? ` ${unit}` : ''}`;
};
export const fmtDuration = (sec) => {
  if (!sec) return '–';
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return h ? `${h}h ${m}m` : m ? `${m}m ${s}s` : `${s}s`;
};
export const fmtClock = (sec) => {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};
export const uid = () => Math.random().toString(36).slice(2, 10);

/** Macros for a quantity in grams from per-100g values (preview only – backend is the source of truth). */
export const calcMacros = (food, grams) => {
  const f = (Number(grams) || 0) / 100;
  return {
    calories: toNum(food.calories_per_100g) * f,
    protein: toNum(food.protein_per_100g) * f,
    carbs: toNum(food.carbs_per_100g) * f,
    fat: toNum(food.fat_per_100g) * f,
  };
};
