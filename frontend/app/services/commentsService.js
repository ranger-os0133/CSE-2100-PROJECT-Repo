import { apiClient } from './api';
import { normalizeComment, unwrapResponse } from './transforms';

export const commentsService = {
  createComment: async (postId, content) => {
    const response = await apiClient.post(`/comments/${postId}`, {
      content,
    });
    return normalizeComment(unwrapResponse(response));
  },

  getPostComments: async (postId, usersById = {}) => {
    const response = await apiClient.get(`/comments/post/${postId}`);
    return Array.isArray(response) ? response.map((comment) => normalizeComment(comment, usersById)) : [];
  },

  getComment: async (commentId, usersById = {}) => {
    const response = await apiClient.get(`/comments/${commentId}`);
    return normalizeComment(response, usersById);
  },

  updateComment: async (commentId, content, usersById = {}) => {
    const response = await apiClient.put(`/comments/${commentId}`, { content });
    return normalizeComment(unwrapResponse(response), usersById);
  },

  deleteComment: async (commentId) => {
    return apiClient.delete(`/comments/${commentId}`);
  },
};
