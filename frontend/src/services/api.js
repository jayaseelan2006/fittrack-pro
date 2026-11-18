import axios from 'axios';

const TOKEN_KEY = 'fittrack_token';
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || '';
    if (err.response?.status === 401 && !url.includes('/auth/login')) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(err);
  },
);

/** Turn any axios/FastAPI error into a readable message. */
export function errorMessage(err) {
  if (!err) return 'Something went wrong';
  const detail = err.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => `${(d.loc || []).filter((x) => x !== 'body').join('.')}: ${d.msg}`.replace(/^: /, '')).join('; ');
  }
  if (typeof detail === 'string') return detail;
  if (err.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (!err.response) return err.message === 'Network Error' ? 'Cannot reach the server. Check your connection.' : err.message || 'Something went wrong';
  return err.message || 'Something went wrong';
}

export default api;
