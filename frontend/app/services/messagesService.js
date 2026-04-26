import { apiClient } from './api';
import { groupConversations, normalizeMessage, unwrapResponse } from './transforms';

export const messagesService = {
  sendMessage: async (recipientId, content) => {
    const response = await apiClient.post('/messages/', {
      recipient_id: recipientId,
      content,
    });
    return normalizeMessage(unwrapResponse(response));
  },

  getConversation: async (userId) => {
    const response = await apiClient.get(`/messages/conversation/${userId}`);
    return Array.isArray(response) ? response.map(normalizeMessage) : [];
  },

  getInbox: async () => {
    const response = await apiClient.get('/messages/inbox');
    return Array.isArray(response) ? response.map(normalizeMessage) : [];
  },

  getSent: async () => {
    const response = await apiClient.get('/messages/sent');
    return Array.isArray(response) ? response.map(normalizeMessage) : [];
  },

  getConversations: async (usersById = {}) => {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const [inbox, sent] = await Promise.all([this.getInbox(), this.getSent()]);
    return groupConversations([...inbox, ...sent], storedUser?.id, usersById);
  },

  markAsRead: async (messageId) => {
    const response = await apiClient.put(`/messages/${messageId}/mark-read`, {});
    return normalizeMessage(unwrapResponse(response));
  },

  deleteMessage: async (messageId) => {
    return apiClient.delete(`/messages/${messageId}`);
  },
};
