import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Camera, Dumbbell, LayoutDashboard, LogOut, Menu, Scale, Settings, Target, TrendingUp, Utensils, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/food', label: 'Food', icon: Utensils },
  { to: '/weight', label: 'Weight', icon: Scale },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/progression', label: 'Progression', icon: TrendingUp },
  { to: '/photos', label: 'Photos', icon: Camera },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink shadow-glow"><Dumbbell className="h-5 w-5" /></span>
      <span className="text-lg font-extrabold tracking-tight">FitTrack <span className="text-accent">Pro</span></span>
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen">
      {/* mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      </header>

      {open && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface p-4 transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-8 flex items-center justify-between px-2 pt-1">
          <Brand />
          <button className="icon-btn lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-accent/10 text-accent shadow-[inset_3px_0_0_rgb(var(--accent))]' : 'text-muted hover:bg-surface2 hover:text-ink'}`}>
              <Icon className="h-[18px] w-[18px]" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-surface2 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent">
            {(user?.full_name || user?.email || '?').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.full_name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <button className="icon-btn" onClick={logout} aria-label="Log out" title="Log out"><LogOut className="h-4 w-4" /></button>
        </div>
      </aside>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl animate-fade-in p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
