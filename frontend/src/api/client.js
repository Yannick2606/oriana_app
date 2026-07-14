const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, details) { super(message); this.name = 'ApiError'; this.status = status; this.details = details; }
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
    ...options,
    credentials: 'include',
    headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;
  if (!response.ok) throw new ApiError(payload?.message || 'Une erreur est survenue.', response.status, payload);
  return payload;
}

export const api = {
  get: (path, options) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, data, options) => apiRequest(path, { ...options, method: 'POST', body: JSON.stringify(data) }),
  put: (path, data, options) => apiRequest(path, { ...options, method: 'PUT', body: JSON.stringify(data) }),
  delete: (path, options) => apiRequest(path, { ...options, method: 'DELETE' }),
};
