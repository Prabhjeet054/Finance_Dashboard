import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { RecordsTable } from '../components/records/RecordsTable';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import type { RecordItem, RecordResult, RecordType } from '../types';

export function RecordsPage() {
  const { token, user } = useAuth();
  const [records, setRecords] = useState<RecordResult | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [recordFilters, setRecordFilters] = useState({
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10,
  });

  const [recordForm, setRecordForm] = useState({
    amount: '',
    type: 'EXPENSE' as RecordType,
    category: '',
    date: '',
    notes: '',
  });

  const [updateForm, setUpdateForm] = useState({
    slug: '',
    amount: '',
    category: '',
    notes: '',
    type: '' as '' | RecordType,
    date: '',
  });

  const canManageRecords = user?.role === 'ADMIN';

  useEffect(() => {
    void fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordFilters.page, token]);

  async function fetchRecords(): Promise<void> {
    setError('');
    const params = new URLSearchParams();
    if (recordFilters.search) params.set('search', recordFilters.search);
    if (recordFilters.type) params.set('type', recordFilters.type);
    if (recordFilters.category) params.set('category', recordFilters.category);
    if (recordFilters.startDate) params.set('startDate', recordFilters.startDate);
    if (recordFilters.endDate) params.set('endDate', recordFilters.endDate);
    params.set('page', String(recordFilters.page));
    params.set('limit', String(recordFilters.limit));

    try {
      const data = await apiRequest<RecordResult>(`/records?${params.toString()}`, 'GET', token);
      setRecords(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onCreateRecord(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');
    setInfo('');

    try {
      await apiRequest<RecordItem>('/records', 'POST', token, {
        amount: Number(recordForm.amount),
        type: recordForm.type,
        category: recordForm.category,
        date: recordForm.date,
        notes: recordForm.notes || undefined,
      });
      setInfo('Record created successfully.');
      setRecordForm({ amount: '', type: 'EXPENSE', category: '', date: '', notes: '' });
      await fetchRecords();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onUpdateRecord(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');
    setInfo('');

    if (!updateForm.slug) return;

    const body: Record<string, unknown> = {};
    if (updateForm.amount) body.amount = Number(updateForm.amount);
    if (updateForm.category) body.category = updateForm.category;
    if (updateForm.notes) body.notes = updateForm.notes;
    if (updateForm.type) body.type = updateForm.type;
    if (updateForm.date) body.date = updateForm.date;

    try {
      await apiRequest<RecordItem>(`/records/${updateForm.slug}`, 'PATCH', token, body);
      setInfo('Record updated.');
      setUpdateForm({ slug: '', amount: '', category: '', notes: '', type: '', date: '' });
      await fetchRecords();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onDeleteRecord(slug: string): Promise<void> {
    setError('');
    setInfo('');
    try {
      await apiRequest<RecordItem>(`/records/${slug}`, 'DELETE', token);
      setInfo('Record deleted.');
      await fetchRecords();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card title="Records" className="lg:col-span-2">
        {error && <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {info && <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{info}</p>}

        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <input
            placeholder="Search (category, notes, slug)"
            value={recordFilters.search}
            onChange={(e) => setRecordFilters((p) => ({ ...p, search: e.target.value, page: 1 }))}
            className="rounded-xl border border-slate-300 px-3 py-2"
          />
          <input
            placeholder="Category"
            value={recordFilters.category}
            onChange={(e) => setRecordFilters((p) => ({ ...p, category: e.target.value, page: 1 }))}
            className="rounded-xl border border-slate-300 px-3 py-2"
          />
          <select
            value={recordFilters.type}
            onChange={(e) => setRecordFilters((p) => ({ ...p, type: e.target.value, page: 1 }))}
            className="rounded-xl border border-slate-300 px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <input
            type="date"
            value={recordFilters.startDate}
            onChange={(e) => setRecordFilters((p) => ({ ...p, startDate: e.target.value, page: 1 }))}
            className="rounded-xl border border-slate-300 px-3 py-2"
          />
          <input
            type="date"
            value={recordFilters.endDate}
            onChange={(e) => setRecordFilters((p) => ({ ...p, endDate: e.target.value, page: 1 }))}
            className="rounded-xl border border-slate-300 px-3 py-2"
          />
          <Button onClick={() => void fetchRecords()}>Apply</Button>
        </div>

        <RecordsTable
          records={records}
          role={user?.role}
          onDelete={(slug) => void onDeleteRecord(slug)}
          onPrev={() => setRecordFilters((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
          onNext={() => setRecordFilters((p) => ({ ...p, page: p.page + 1 }))}
        />
      </Card>

      <div className="grid gap-6">
        {canManageRecords && (
          <Card title="Create Record">
            <form className="grid gap-3" onSubmit={(e) => void onCreateRecord(e)}>
              <InputField
                label="Amount"
                value={recordForm.amount}
                onChange={(value) => setRecordForm((p) => ({ ...p, amount: value }))}
                type="number"
                step="0.01"
                required
              />
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Type
                <select
                  value={recordForm.type}
                  onChange={(e) => setRecordForm((p) => ({ ...p, type: e.target.value as RecordType }))}
                  className="rounded-xl border border-slate-300 px-3 py-2"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </label>
              <InputField
                label="Category"
                value={recordForm.category}
                onChange={(value) => setRecordForm((p) => ({ ...p, category: value }))}
                required
              />
              <InputField
                label="Date"
                type="date"
                value={recordForm.date}
                onChange={(value) => setRecordForm((p) => ({ ...p, date: value }))}
                required
              />
              <InputField
                label="Notes"
                value={recordForm.notes}
                onChange={(value) => setRecordForm((p) => ({ ...p, notes: value }))}
              />
              <Button type="submit">Create</Button>
            </form>
          </Card>
        )}

        {canManageRecords && (
          <Card title="Update Record">
            <form className="grid gap-3" onSubmit={(e) => void onUpdateRecord(e)}>
              <InputField
                label="Record Slug"
                value={updateForm.slug}
                onChange={(value) => setUpdateForm((p) => ({ ...p, slug: value }))}
                required
              />
              <InputField
                label="Amount"
                value={updateForm.amount}
                onChange={(value) => setUpdateForm((p) => ({ ...p, amount: value }))}
                type="number"
                step="0.01"
              />
              <InputField
                label="Category"
                value={updateForm.category}
                onChange={(value) => setUpdateForm((p) => ({ ...p, category: value }))}
              />
              <InputField
                label="Date"
                type="date"
                value={updateForm.date}
                onChange={(value) => setUpdateForm((p) => ({ ...p, date: value }))}
              />
              <InputField
                label="Notes"
                value={updateForm.notes}
                onChange={(value) => setUpdateForm((p) => ({ ...p, notes: value }))}
              />
              <Button type="submit">Update</Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
