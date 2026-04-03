import type { User } from '../../types';
import { Button } from '../ui/Button';

type Props = {
  users: User[];
  onDeactivate: (slug: string) => void;
};

export function UsersTable({ users, onDeactivate }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-3 py-2 font-medium text-slate-900">{user.name}</td>
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2">{user.role}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {user.status === 'ACTIVE' ? (
                    <Button variant="danger" onClick={() => onDeactivate(user.slug)}>
                      Deactivate
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
    </div>
  );
}
