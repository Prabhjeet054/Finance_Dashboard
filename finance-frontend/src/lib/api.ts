import type { ApiResponse } from '../types';

const defaultApiBaseUrl = import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '/api/v1';

function normalizeApiBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');

  if (!trimmed) {
    return '/api/v1';
  }

  return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
}

function normalizeRequestPath(path: string): string {
  if (!path.startsWith('/')) {
    return `/${path}`;
  }

  return path;
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl);

export async function apiRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  token?: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const normalizedPath = normalizeRequestPath(path);

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !json.success) {
    throw new Error(json.message || 'Request failed');
  }

  if (!json.data) {
    throw new Error('No response data');
  }

  return json.data;
}
