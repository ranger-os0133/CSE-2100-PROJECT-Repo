import { apiClient } from './api';
import { normalizeUser, unwrapResponse } from './transforms';

function getCurrentUserId(fallbackUserId) {
  if (fallbackUserId != null) {
    return fallbackUserId;
  }

  const storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  return storedUser?.id;
}

export const usersService = {
  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me');
    return normalizeUser(response);
  },

  getAllUsers: async () => {
    const response = await apiClient.get('/users/list/all');
    return Array.isArray(response) ? response.map(normalizeUser) : [];
  },

  getUser: async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return normalizeUser(response);
  },

  getUserByUsername: async (username) => {
    const response = await apiClient.get(`/users/by-username/${username}`);
    return normalizeUser(response);
  },

  updateCurrentUser: async (data, userId) => {
    const resolvedUserId = getCurrentUserId(userId);
    const response = await apiClient.put(`/users/${resolvedUserId}`, data);
    const user = normalizeUser(unwrapResponse(response));
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },

  deleteCurrentUser: async (userId) => {
    const resolvedUserId = getCurrentUserId(userId);
    return apiClient.delete(`/users/${resolvedUserId}`);
  },
};
