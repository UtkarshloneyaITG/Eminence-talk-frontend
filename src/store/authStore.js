import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      register: async (username, email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/api/auth/register', { username, email, password });
          localStorage.setItem('et_access_token', data.accessToken);
          localStorage.setItem('et_refresh_token', data.refreshToken);
          connectSocket(data.accessToken);
          set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.response?.data?.error || 'Registration failed' };
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/api/auth/login', { email, password });
          localStorage.setItem('et_access_token', data.accessToken);
          localStorage.setItem('et_refresh_token', data.refreshToken);
          connectSocket(data.accessToken);
          set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.response?.data?.error || 'Login failed' };
        }
      },

      logout: async () => {
        try {
          await api.post('/api/auth/logout');
        } catch (_) {}
        localStorage.removeItem('et_access_token');
        localStorage.removeItem('et_refresh_token');
        disconnectSocket();
        set({ user: null, accessToken: null, isAuthenticated: false });
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

      fetchMe: async () => {
        try {
          const { data } = await api.get('/api/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: 'et-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
