import type { FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { InputField } from '../ui/InputField';

type Props = {
  tab: 'login' | 'register';
  form: { name: string; email: string; password: string };
  onTabChange: (tab: 'login' | 'register') => void;
  onFormChange: (next: { name: string; email: string; password: string }) => void;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onRegister: (event: FormEvent<HTMLFormElement>) => void;
  error: string;
  info: string;
};

export function AuthPanel({
  tab,
  form,
  onTabChange,
  onFormChange,
  onLogin,
  onRegister,
  error,
  info,
}: Props) {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-5xl place-items-center px-4 py-10">
      <Card
        className="w-full max-w-xl border-brand-100 bg-white/95"
        title="Finance Control Desk"
        subtitle="Secure analytics workspace for records, users, and role-based actions."
      >
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-brand-50 p-1">
          <button
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === 'login' ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-700/70'
            }`}
            onClick={() => onTabChange('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === 'register' ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-700/70'
            }`}
            onClick={() => onTabChange('register')}
            type="button"
          >
            Register
          </button>
        </div>

        <form className="grid gap-3" onSubmit={tab === 'login' ? onLogin : onRegister}>
          {tab === 'register' && (
            <InputField
              label="Name"
              required
              value={form.name}
              onChange={(value) => onFormChange({ ...form, name: value })}
            />
          )}
          <InputField
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(value) => onFormChange({ ...form, email: value })}
          />
          <InputField
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(value) => onFormChange({ ...form, password: value })}
          />
          <Button type="submit">{tab === 'login' ? 'Sign In' : 'Create Account'}</Button>
        </form>

        {error && <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        {info && <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</p>}
      </Card>
    </div>
  );
}
