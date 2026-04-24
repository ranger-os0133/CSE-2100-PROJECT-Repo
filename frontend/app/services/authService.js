import { apiClient } from './api';
import { normalizeUser } from './transforms';

export const authService = {
  register: async (email, username, password) => {
    const response = await apiClient.post('/auth/register', {
      email,
      username,
      password,
    });

    const userData = normalizeUser(response);
    if (userData?.id) {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }

    return userData;
  },

  adminRegister: async (email, username, password, adminCode) => {
    const response = await apiClient.post('/auth/admin/register', {
      email,
      username,
      password,
      admin_code: adminCode,
    });

    return normalizeUser(response);
  },

  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    if (response.access_token) {
      apiClient.setToken(response.access_token);
      apiClient.setRefreshToken(response.refresh_token);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);

      const userResponse = await apiClient.get('/users/me');
      const userData = normalizeUser(userResponse);
      localStorage.setItem('currentUser', JSON.stringify(userData));

      return userData;
    }

    return response;
  },

  adminLogin: async (email, password, adminCode) => {
    const response = await apiClient.post('/auth/admin/login', {
      email,
      password,
      admin_code: adminCode,
    });

    if (response.access_token) {
      apiClient.setToken(response.access_token);
      apiClient.setRefreshToken(response.refresh_token);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);

      const userResponse = await apiClient.get('/users/me');
      const userData = normalizeUser(userResponse);
      localStorage.setItem('currentUser', JSON.stringify(userData));

      return userData;
    }

    return response;
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.request('/auth/refresh', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    if (response.access_token) {
      apiClient.setToken(response.access_token);
      apiClient.setRefreshToken(response.refresh_token);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      return response;
    }

    throw new Error('Failed to refresh token');
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me');
    return normalizeUser(response);
  },

  logout: () => {
    apiClient.setToken(null);
    apiClient.setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
  },
};
