import axios from 'axios';

const api = axios.create({
  baseURL: 'https://eminence-talk-backend.onrender.com',
  // baseURL: 'http://localhost:5000',
  withCredentials: true,
  timeout: 15000,
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('et_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !original._retry
    ) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('et_refresh_token');
        const { data } = await axios.post(
          'https://eminence-talk-backend.onrender.com/api/auth/refresh',
          // 'http://localhost:5000/api/auth/refresh',
          { refreshToken }
        );
        localStorage.setItem('et_access_token', data.accessToken);
        localStorage.setItem('et_refresh_token', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('et_access_token');
        localStorage.removeItem('et_refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
