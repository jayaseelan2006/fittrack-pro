import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import api, { tokenStore } from '../src/services/api';
import App from '../src/App';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';

globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
window.HTMLElement.prototype.scrollIntoView = () => {};

const pts = [{ date: '2026-11-01', weight_kg: '70.0' }, { date: '2026-11-08', weight_kg: '71.5' }];
const days = [{ date: '2026-11-11', calories: '2100', protein: '140', carbs: '230', fat: '60' }, { date: '2026-11-12', calories: '2400', protein: '155', carbs: '260', fat: '70' }];
const food = { id: 1, name: 'Chicken Breast', category: 'Meat', calories_per_100g: '165', protein_per_100g: '31', carbs_per_100g: '0', fat_per_100g: '3.6', is_custom: false };
const hist = [{ date: '2026-11-01', max_weight_kg: '20', total_sets: 3, total_reps: 30, total_volume: '600' }, { date: '2026-11-08', max_weight_kg: '22.5', total_sets: 3, total_reps: 30, total_volume: '675' }];
const strength = [{ exercise_id: 1, exercise_name: 'Bench Press', points: hist.map((h) => ({ date: h.date, max_weight_kg: h.max_weight_kg })) }];
const record = { exercise_id: 1, exercise_name: 'Bench Press', record_type: 'max_weight', value: '22.5', achieved_date: '2026-11-08' };
const goal = { id: 1, goal_type: 'weight', title: 'Reach 75 kg', start_value: '70', current_value: '71.5', target_value: '75', unit: 'kg', start_date: '2026-11-01', end_date: null, is_weekly_challenge: false, status: 'active', progress_pct: 30 };
const workout = { id: 5, name: 'Push Day', category: 'chest', workout_date: '2026-11-13', status: 'planned', started_at: null, duration_seconds: null, notes: null, total_volume: 0, exercise_count: 1,
  exercises: [{ id: 1, exercise_id: 1, exercise_name: 'Bench Press', muscle_group: 'chest', equipment: 'Barbell', notes: null, sets: [{ id: 1, set_number: 1, reps: 10, weight_kg: '20', rest_seconds: 60, is_completed: false }] }] };
const profile = { id: 1, email: 'a@b.com', full_name: 'Alex Carter', gender: null, date_of_birth: null, height_cm: '175', fitness_goal: 'muscle_gain', target_weight_kg: '75', daily_calorie_target: 2500, daily_protein_target: 150, timezone: 'UTC', theme: 'dark' };
const report = { period_start: '2026-11-07', period_end: '2026-11-13', avg_calories: 2300, avg_protein: 148, avg_carbs: 250, avg_fat: 65, workouts_completed: 3, total_volume: 5400, weight_change: 0.8, days_logged: 6 };

const routes = {
  'GET /auth/me': profile,
  'GET /dashboard/summary': { current_weight: '71.5', target_weight: '75', weight_change: '1.5', weight_gained: '1.5', calories: '2100', protein: '140', carbs: '230', fat: '60', calorie_target: 2500, protein_target: 150, today_workout: { id: 5, name: 'Push Day', status: 'planned' }, weekly_workout_count: 2, total_exercises: 40, strength_records: [{ exercise_id: 1, exercise_name: 'Bench Press', max_weight_kg: '22.5' }], goals: [{ id: 1, title: 'Reach 75 kg', progress_pct: 30 }] },
  'GET /dashboard/weight-progress': pts,
  'GET /dashboard/nutrition-summary': days,
  'GET /dashboard/workout-summary': [{ label: 'W45', workouts: 2, volume: 3000 }],
  'GET /dashboard/strength-progress': strength,
  'GET /food-logs/daily-summary': { date: '2026-11-13', calories: '2100', protein: '140', carbs: '230', fat: '60', calorie_target: 2500, protein_target: 150, remaining_calories: '400', remaining_protein: '10' },
  'GET /food-logs/weekly-summary': { days, avg_calories: 2250, avg_protein: 147, avg_carbs: 245, avg_fat: 65, calorie_target: 2500, protein_target: 150 },
  'GET /food-logs': [{ id: 1, food_id: 1, food_name: 'Chicken Breast', log_date: '2026-11-13', meal_type: 'lunch', quantity_grams: '200', calories: '330', protein: '62', carbs: '0', fat: '7.2' }],
  'GET /foods': [food],
  'GET /weight/progress': { current_weight: '71.5', target_weight: '75', weight_change: '1.5', bmi: '23.3', bmi_category: 'normal', weekly_average: '71.0', monthly_average: '70.8', points: pts },
  'GET /weight': [{ id: 1, log_date: '2026-11-08', weight_kg: '71.5', notes: 'ok' }],
  'GET /measurements': [{ id: 1, measured_date: '2026-11-08', chest_cm: '100', waist_cm: '80', arms_cm: '35', shoulders_cm: null, thighs_cm: '58', hips_cm: '95' }],
  'GET /workouts': [{ ...workout, exercises: undefined }],
  'GET /workouts/5': workout,
  'GET /exercises': [{ id: 1, name: 'Bench Press', muscle_group: 'chest', equipment: 'Barbell', is_custom: false }],
  'GET /workout-logs': [{ id: 1, exercise_name: 'Bench Press', log_date: '2026-11-08', total_sets: 3, total_reps: 30, max_weight_kg: '22.5', total_volume: '675' }],
  'GET /progression/1': { exercise: { id: 1, name: 'Bench Press' }, status: 'improved', weight_change: '2.5', rep_change: 0, volume_change: '75', strength_progress_pct: '12.5', suggestion: 'Try repeating 22.5 kg for 3x10 before adding weight.' },
  'GET /progression/1/history': hist,
  'GET /progression/1/compare': { previous: hist[0], current: hist[1], weight_change: '2.5', volume_change: '75', rep_change: 0, status: 'improved' },
  'GET /progression/personal-records': [record],
  'GET /progression/volume-history': hist.map((h) => ({ date: h.date, total_volume: h.total_volume })),
  'GET /goals': [goal],
  'GET /progress-photos': [],
  'GET /analytics/weekly': report, 'GET /analytics/monthly': report,
  'GET /analytics/weight': { points: pts, change: '1.5' },
  'GET /analytics/nutrition': { days, avg_calories: 2250, avg_protein: 147, avg_carbs: 245, avg_fat: 65, calorie_target: 2500, protein_target: 150 },
  'GET /analytics/workouts': { consistency_pct: 75, weekly: [{ label: 'W45', workouts: 3 }], muscle_frequency: [{ muscle_group: 'chest', count: 4 }] },
  'GET /analytics/strength': strength,
};

const errors = [];
beforeAll(() => {
  tokenStore.set('test');
  api.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url.split('?')[0]}`;
    if (!(key in routes)) { errors.push(`UNMOCKED ${key}`); const e = new Error('nf'); e.response = { status: 404, data: { detail: 'not mocked' } }; e.config = config; throw e; }
    return { data: routes[key], status: 200, statusText: 'OK', headers: {}, config };
  };
  vi.spyOn(console, 'error').mockImplementation((...a) => { const m = String(a[0]); if (!m.includes('act(') && !m.includes('width(0)')) errors.push(m.slice(0, 200)); });
});

const open = (path) => render(<MemoryRouter initialEntries={[path]}><ToastProvider><AuthProvider><App /></AuthProvider></ToastProvider></MemoryRouter>);

const cases = [
  ['/', 'Reach 75 kg'], ['/', 'Bench Press'],
  ['/food', 'Chicken Breast'], ['/weight', '23.3'], ['/workouts', 'Push Day'],
  ['/workouts/5', 'Add exercise'], ['/progression', 'Select an exercise'],
  ['/goals', 'Reach 75 kg'], ['/analytics', 'Personal record history'],
  ['/settings', 'Full name'], ['/photos', 'Upload a photo'],
];
describe('pages render with contract data', () => {
  for (const [path, text] of cases) {
    it(`${path} shows "${text}"`, async () => {
      open(path);
      await waitFor(() => expect(screen.getAllByText(new RegExp(text, 'i')).length).toBeGreaterThan(0), { timeout: 4000 });
      cleanup();
    });
  }
  it('workout session shows last-session hint and volume', async () => {
    open('/workouts/5');
    await waitFor(() => expect(screen.getByText(/Last \(/)).toBeTruthy(), { timeout: 4000 });
    expect(screen.getByText('Start workout')).toBeTruthy();
    cleanup();
  });
  it('progression page loads exercise detail', async () => {
    open('/progression');
    await waitFor(() => screen.getByText(/Select an exercise/i));
    const { fireEvent } = await import('@testing-library/react');
    const sel = (await screen.findAllByRole('combobox'))[0];
    fireEvent.change(sel, { target: { value: '1' } });
    await waitFor(() => expect(screen.getByText('Improved')).toBeTruthy(), { timeout: 4000 });
    expect(screen.getByText(/never changed automatically/i)).toBeTruthy();
    cleanup();
  });
  it('no unmocked calls or React errors', () => { expect(errors).toEqual([]); });
});
