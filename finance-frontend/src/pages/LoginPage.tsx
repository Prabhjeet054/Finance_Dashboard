import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthPanel } from '../components/auth/AuthPanel';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import type { AuthData, User } from '../types';

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function onLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');
    setInfo('');
    try {
      const data = await apiRequest<AuthData>('/auth/login', 'POST', undefined, {
        email: authForm.email,
        password: authForm.password,
      });
      login(data);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onRegister(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');
    setInfo('');
    try {
      await apiRequest<User>('/auth/register', 'POST', undefined, {
        name: authForm.name,
        email: authForm.email,
        password: authForm.password,
      });
      setInfo('Account created. You can now log in.');
      setAuthTab('login');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500">
      <AuthPanel
        tab={authTab}
        form={authForm}
        onTabChange={setAuthTab}
        onFormChange={setAuthForm}
        onLogin={onLogin}
        onRegister={onRegister}
        error={error}
        info={info}
      />
    </div>
  );
}
