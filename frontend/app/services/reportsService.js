import { apiClient } from './api';
import { normalizeReport, unwrapResponse } from './transforms';

export const reportsService = {
  createReport: async ({ postId = null, commentId = null, reason, description = '' }) => {
    const response = await apiClient.post('/reports/', {
      post_id: postId,
      comment_id: commentId,
      reason,
      description,
    });
    return normalizeReport(unwrapResponse(response));
  },

  getMyReports: async () => {
    const response = await apiClient.get('/reports/mine');
    return Array.isArray(response) ? response.map(normalizeReport) : [];
  },

  getReports: async (statusFilter = '') => {
    const suffix = statusFilter ? `?status_filter=${encodeURIComponent(statusFilter)}` : '';
    const response = await apiClient.get(`/reports${suffix}`);
    return Array.isArray(response) ? response.map(normalizeReport) : [];
  },

  getReport: async (reportId) => {
    const response = await apiClient.get(`/reports/${reportId}`);
    return normalizeReport(response);
  },

  reviewReport: async (reportId, status) => {
    const response = await apiClient.put(`/reports/${reportId}/review`, { status });
    return normalizeReport(unwrapResponse(response));
  },

  deleteReport: async (reportId) => {
    return apiClient.delete(`/reports/${reportId}`);
  },
};
