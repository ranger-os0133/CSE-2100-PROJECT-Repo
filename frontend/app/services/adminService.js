import { apiClient } from './api';
import { normalizeAdminDashboard, normalizeAdminReport, normalizeUser } from './transforms';

export const adminService = {
  getDashboard: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return normalizeAdminDashboard(response);
  },

  getReports: async ({ status = '', search = '' } = {}) => {
    const params = new URLSearchParams();
    if (status) {
      params.set('status_filter', status);
    }
    if (search) {
      params.set('search', search);
    }

    const suffix = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get(`/admin/reports${suffix}`);
    return Array.isArray(response) ? response.map(normalizeAdminReport).filter(Boolean) : [];
  },

  reviewReport: async (reportId, status) => {
    const response = await apiClient.patch(`/admin/reports/${reportId}`, { status });
    return normalizeAdminReport(response);
  },

  getUsers: async (search = '') => {
    const suffix = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await apiClient.get(`/admin/users${suffix}`);
    return Array.isArray(response) ? response.map(normalizeUser).filter(Boolean) : [];
  },

  updateUserStatus: async (userId, isActive) => {
    const response = await apiClient.patch(`/admin/users/${userId}`, { is_active: isActive });
    return normalizeUser(response);
  },

  deletePost: async (postId) => apiClient.delete(`/admin/posts/${postId}`),
  deleteComment: async (commentId) => apiClient.delete(`/admin/comments/${commentId}`),
};