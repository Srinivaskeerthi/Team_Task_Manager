import { create } from 'zustand';
import { loginAPI, registerAPI, getMeAPI, logoutAPI } from '../api/auth';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('flowsphere_user') || 'null'),
  token: localStorage.getItem('flowsphere_token') || null,
  isAuthenticated: !!localStorage.getItem('flowsphere_token'),
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const { data } = await loginAPI(credentials);
      localStorage.setItem('flowsphere_token', data.token);
      localStorage.setItem('flowsphere_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data } = await registerAPI(userData);
      localStorage.setItem('flowsphere_token', data.token);
      localStorage.setItem('flowsphere_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, loading: false });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    try { await logoutAPI(); } catch(e) {}
    localStorage.removeItem('flowsphere_token');
    localStorage.removeItem('flowsphere_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('flowsphere_token');
    if (!token) { set({ isAuthenticated: false }); return; }
    try {
      const { data } = await getMeAPI();
      localStorage.setItem('flowsphere_user', JSON.stringify(data.user));
      set({ user: data.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('flowsphere_token');
      localStorage.removeItem('flowsphere_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  updateUser: (userData) => {
    localStorage.setItem('flowsphere_user', JSON.stringify(userData));
    set({ user: userData });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
