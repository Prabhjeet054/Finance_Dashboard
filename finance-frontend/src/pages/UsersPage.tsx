import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';
import { Button } from '../components/ui/Button';
import { UsersTable } from '../components/users/UsersTable';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import type { Role, User, UsersResult } from '../types';

export function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<UsersResult | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'VIEWER' as Role,
  });

  useEffect(() => {
    void fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function fetchUsers(): Promise<void> {
    setError('');
    try {
      const data = await apiRequest<UsersResult>('/users?page=1&limit=20', 'GET', token);
      setUsers(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onCreateUser(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');
    setInfo('');

    try {
      await apiRequest<User>('/users', 'POST', token, userForm);
      setInfo('User created successfully.');
      setUserForm({ name: '', email: '', password: '', role: 'VIEWER' });
      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onDeactivateUser(slug: string): Promise<void> {
    setError('');
    setInfo('');
    try {
      await apiRequest<User>(`/users/${slug}`, 'DELETE', token);
      setInfo('User deactivated.');
      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <Card title="User Management (Admin)">
      {error && <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {info && <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{info}</p>}

      <form className="mb-4 grid gap-3 md:grid-cols-5" onSubmit={(e) => void onCreateUser(e)}>
        <InputField
          label="Name"
          value={userForm.name}
          onChange={(value) => setUserForm((p) => ({ ...p, name: value }))}
          required
        />
        <InputField
          label="Email"
          type="email"
          value={userForm.email}
          onChange={(value) => setUserForm((p) => ({ ...p, email: value }))}
          required
        />
        <InputField
          label="Password"
          type="password"
          value={userForm.password}
          onChange={(value) => setUserForm((p) => ({ ...p, password: value }))}
          required
        />
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Role
          <select
            value={userForm.role}
            onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value as Role }))}
            className="rounded-xl border border-slate-300 px-3 py-2"
          >
            <option value="VIEWER">VIEWER</option>
            <option value="ANALYST">ANALYST</option>
          </select>
        </label>
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Create User
          </Button>
        </div>
      </form>

      <UsersTable users={users?.items ?? []} onDeactivate={(slug) => void onDeactivateUser(slug)} />
    </Card>
  );
}
