import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from './components/Async';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const FoodPage = lazy(() => import('./pages/FoodPage'));
const WeightPage = lazy(() => import('./pages/WeightPage'));
const WorkoutsPage = lazy(() => import('./pages/WorkoutsPage'));
const WorkoutSessionPage = lazy(() => import('./pages/workouts/WorkoutSessionPage'));
const ProgressionPage = lazy(() => import('./pages/ProgressionPage'));
const PhotosPage = lazy(() => import('./pages/PhotosPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><Spinner className="h-7 w-7" /></div>}>
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="food" element={<FoodPage />} />
        <Route path="weight" element={<WeightPage />} />
        <Route path="workouts" element={<WorkoutsPage />} />
        <Route path="workouts/:id" element={<WorkoutSessionPage />} />
        <Route path="progression" element={<ProgressionPage />} />
        <Route path="photos" element={<PhotosPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
