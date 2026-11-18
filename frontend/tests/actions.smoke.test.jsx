import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import api, { tokenStore } from '../src/services/api';
import App from '../src/App';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';

globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
const sent = [];
let started = false;
const profile = { id: 1, email: 'a@b.com', full_name: 'Alex', theme: 'dark' };
const workout = { id: 5, name: 'Push Day', category: 'chest', workout_date: '2026-11-13', status: 'planned', started_at: null, notes: null,
  exercises: [{ id: 1, exercise_id: 1, exercise_name: 'Bench Press', muscle_group: 'chest', equipment: 'Barbell', notes: null, sets: [{ id: 1, set_number: 1, reps: 10, weight_kg: '20.00', rest_seconds: 60, is_completed: false }] }] };

beforeAll(() => {
  api.defaults.adapter = async (config) => {
    const m = config.method.toUpperCase(); const url = config.url;
    if (m !== 'GET') sent.push({ m, url, body: config.data ? JSON.parse(config.data) : null });
    let data = [];
    if (url === '/auth/login') data = { access_token: 'tok', token_type: 'bearer' };
    else if (url === '/auth/me') { if (!tokenStore.get()) { const e = new Error('401'); e.response = { status: 401, data: { detail: 'Not authenticated' } }; e.config = config; throw e; } data = profile; }
    else if (url === '/workouts/5') { if (m === 'PUT' && JSON.parse(config.data).status === 'in_progress') started = true; data = started ? { ...workout, status: 'in_progress', started_at: '2026-11-13T10:00:00' } : workout; }
    else if (url.includes('history')) data = [];
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
});
const open = (p) => render(<MemoryRouter initialEntries={[p]}><ToastProvider><AuthProvider><App /></AuthProvider></ToastProvider></MemoryRouter>);

describe('mutations', () => {
  it('logged-out user is redirected to login and can sign in', async () => {
    tokenStore.clear();
    open('/workouts');
    const email = await screen.findByPlaceholderText('you@example.com');
    fireEvent.change(email, { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() => expect(sent.find((s) => s.url === '/auth/login')).toBeTruthy());
    expect(sent.find((s) => s.url === '/auth/login').body).toEqual({ email: 'a@b.com', password: 'secret123' });
    await waitFor(() => expect(tokenStore.get()).toBe('tok'));
    await screen.findByText('Alex'); // sidebar user block => authenticated layout rendered
    cleanup();
  });
  it('Start workout PUTs a validated payload with status in_progress', async () => {
    tokenStore.set('tok');
    open('/workouts/5');
    fireEvent.click(await screen.findByText('Start workout'));
    await waitFor(() => expect(sent.find((s) => s.m === 'PUT' && s.url === '/workouts/5')).toBeTruthy());
    const body = sent.find((s) => s.m === 'PUT').body;
    expect(body.status).toBe('in_progress');
    expect(body.exercises[0]).toMatchObject({ exercise_id: 1, sets: [{ set_number: 1, reps: 10, weight_kg: 20, rest_seconds: 60, is_completed: false }] });
    await screen.findByText(/Finish workout/i);
    cleanup();
  });
});
