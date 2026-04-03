import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-6">
        <Card className="bg-gradient-to-r from-brand-900 to-brand-700 text-white shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl">Finance Control Desk</h1>
              <p className="mt-1 text-sm text-white/85">
                {user?.name} | {user?.role} | {user?.email}
              </p>
            </div>
            <Button variant="danger" onClick={logout}>
              Logout
            </Button>
          </div>

          <nav className="mt-4 flex flex-wrap gap-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-white text-brand-700' : 'bg-white/10 text-white hover:bg-white/20'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/records"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-white text-brand-700' : 'bg-white/10 text-white hover:bg-white/20'
                }`
              }
            >
              Records
            </NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-white text-brand-700' : 'bg-white/10 text-white hover:bg-white/20'
                  }`
                }
              >
                Users
              </NavLink>
            )}
          </nav>
        </Card>

        <Outlet />
      </div>
    </div>
  );
}
