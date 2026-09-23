const API = import.meta.env.VITE_API_URL || '/api';

// Low-level fetch wrapper. `token`, when provided, is sent as a bearer
// token. Throws an Error with `.status` set on any non-2xx response.
export async function apiRequest(path, options = {}, token) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}
