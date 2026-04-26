import { apiClient } from './api';
import { normalizePost, unwrapResponse } from './transforms';

export const postsService = {
  createPost: async ({ title, content, isAnonymous = false }) => {
    const response = await apiClient.post('/posts/', {
      title,
      content,
      is_anonymous: isAnonymous,
    });
    return normalizePost(unwrapResponse(response));
  },

  getMyPosts: async () => {
    const response = await apiClient.get('/posts/me');
    return Array.isArray(response) ? response.map(normalizePost) : [];
  },

  getAllPosts: async (skip = 0, limit = 50) => {
    const response = await apiClient.get(`/posts/?skip=${skip}&limit=${limit}`);
    return Array.isArray(response) ? response.map(normalizePost) : [];
  },

  getPost: async (postId) => {
    const response = await apiClient.get(`/posts/${postId}`);
    return normalizePost(response);
  },

  getPostsByAuthor: async (authorId) => {
    const response = await apiClient.get(`/posts/user/${authorId}`);
    return Array.isArray(response) ? response.map(normalizePost) : [];
  },

  updatePost: async (postId, title, content) => {
    const response = await apiClient.put(`/posts/${postId}`, { title, content });
    return normalizePost(unwrapResponse(response));
  },

  deletePost: async (postId) => {
    return apiClient.delete(`/posts/${postId}`);
  },
};
