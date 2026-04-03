import type { Summary } from '../../types';
import { Card } from '../ui/Card';

type Props = {
  summary: Summary;
};

const metricStyle = 'rounded-xl border border-slate-200 bg-slate-50 p-4';

export function SummaryCards({ summary }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className={metricStyle}>
        <p className="text-sm text-slate-500">Total Income</p>
        <p className="mt-2 text-2xl font-bold text-emerald-700">${summary.totalIncome.toLocaleString()}</p>
      </Card>
      <Card className={metricStyle}>
        <p className="text-sm text-slate-500">Total Expenses</p>
        <p className="mt-2 text-2xl font-bold text-rose-700">${summary.totalExpenses.toLocaleString()}</p>
      </Card>
      <Card className={metricStyle}>
        <p className="text-sm text-slate-500">Net Balance</p>
        <p className="mt-2 text-2xl font-bold text-brand-700">${summary.netBalance.toLocaleString()}</p>
      </Card>
      <Card className={metricStyle}>
        <p className="text-sm text-slate-500">Record Count</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{summary.recordCount}</p>
      </Card>
    </div>
  );
}
