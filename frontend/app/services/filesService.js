import { apiClient } from './api';
import { normalizeFile, unwrapResponse } from './transforms';

function buildUploadQuery(postId, messageId) {
  const params = new URLSearchParams();
  if (postId != null) {
    params.set('post_id', postId);
  }
  if (messageId != null) {
    params.set('message_id', messageId);
  }
  return params.toString();
}

export const filesService = {
  uploadFile: async (file, { postId = null, messageId = null } = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    const query = buildUploadQuery(postId, messageId);
    const response = await apiClient.post(`/files/upload${query ? `?${query}` : ''}`, formData);
    return normalizeFile(unwrapResponse(response));
  },

  getFile: async (fileId) => {
    const response = await apiClient.get(`/files/${fileId}`);
    return normalizeFile(response);
  },

  getUserFiles: async (userId) => {
    const response = await apiClient.get(`/files/user/${userId}`);
    return Array.isArray(response) ? response.map(normalizeFile) : [];
  },

  deleteFile: async (fileId) => {
    return apiClient.delete(`/files/${fileId}`);
  },
};
