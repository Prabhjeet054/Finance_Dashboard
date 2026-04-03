import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import type { CategoryBreakdown, RecentItem, Summary, Trend } from '../types';

export function DashboardPage() {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [error, setError] = useState('');
  const [trendYear, setTrendYear] = useState(new Date().getFullYear());

  const canSeeDashboardStats = user?.role === 'ADMIN' || user?.role === 'ANALYST';
  const maxTrend = useMemo(
    () => Math.max(1, ...trends.map((t) => Math.max(t.income, t.expenses))),
    [trends]
  );

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendYear, token]);

  async function loadDashboard(): Promise<void> {
    setError('');
    try {
      const jobs: Promise<unknown>[] = [
        apiRequest<RecentItem[]>('/dashboard/recent', 'GET', token).then(setRecent),
      ];

      if (canSeeDashboardStats) {
        jobs.push(
          apiRequest<Summary>('/dashboard/summary', 'GET', token).then(setSummary),
          apiRequest<CategoryBreakdown[]>('/dashboard/categories', 'GET', token).then(setCategories),
          apiRequest<Trend[]>(`/dashboard/trends?year=${trendYear}`, 'GET', token).then(setTrends)
        );
      }

      await Promise.all(jobs);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="grid gap-6">
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      {summary && <SummaryCards summary={summary} />}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Recent Activity" className="xl:col-span-1">
          <ul className="grid gap-3">
            {recent.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.category}</p>
                  <p className="text-xs text-slate-500">
                    {item.userName} | {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${item.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {item.type} ${Number(item.amount).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {canSeeDashboardStats && (
          <Card title="Category Breakdown" className="xl:col-span-1">
            <ul className="grid gap-2">
              {categories.map((c) => (
                <li key={c.category} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <span>{c.category}</span>
                  <span className="font-semibold text-slate-700">
                    ${c.totalAmount.toLocaleString()} ({c.count})
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {canSeeDashboardStats && (
          <Card title="Monthly Trends" className="xl:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <input
                type="number"
                value={trendYear}
                onChange={(e) => setTrendYear(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
              <Button onClick={() => void loadDashboard()}>Load</Button>
            </div>
            <div className="grid gap-2">
              {trends.map((t) => (
                <div key={t.month} className="rounded-xl border border-slate-200 p-2">
                  <p className="text-xs font-semibold text-slate-500">M{t.month}</p>
                  <div className="mt-2 grid gap-1">
                    <div className="h-2 rounded bg-slate-100">
                      <div className="h-2 rounded bg-emerald-500" style={{ width: `${(t.income / maxTrend) * 100}%` }} />
                    </div>
                    <div className="h-2 rounded bg-slate-100">
                      <div className="h-2 rounded bg-rose-500" style={{ width: `${(t.expenses / maxTrend) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
