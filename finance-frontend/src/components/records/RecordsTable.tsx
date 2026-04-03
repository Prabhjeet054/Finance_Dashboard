import type { RecordItem, RecordResult, Role } from '../../types';
import { Button } from '../ui/Button';

type Props = {
  records: RecordResult | null;
  role?: Role;
  onDelete: (slug: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

export function RecordsTable({ records, role, onDelete, onPrev, onNext }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {records?.items.map((record: RecordItem) => (
              <tr key={record.id}>
                <td className="px-3 py-2">{new Date(record.date).toLocaleDateString()}</td>
                <td className="px-3 py-2">{record.category}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      record.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {record.type}
                  </span>
                </td>
                <td className="px-3 py-2 font-medium text-slate-900">${Number(record.amount).toLocaleString()}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{record.slug}</td>
                <td className="px-3 py-2">
                  {role === 'ADMIN' ? (
                    <Button variant="danger" onClick={() => onDelete(record.slug)}>
                      Delete
                    </Button>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-3">
        <Button variant="ghost" disabled={!records || records.meta.page <= 1} onClick={onPrev}>
          Prev
        </Button>
        <span className="text-xs text-slate-600">
          Page {records?.meta.page ?? 1} of {records?.meta.totalPages ?? 1}
        </span>
        <Button
          variant="ghost"
          disabled={!records || records.meta.page >= records.meta.totalPages}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
