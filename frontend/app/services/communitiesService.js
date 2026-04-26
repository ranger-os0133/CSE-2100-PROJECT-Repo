import { apiClient } from './api';
import {
  normalizeCommunity,
  normalizeCommunityMember,
  normalizeCommunityPost,
  unwrapResponse,
} from './transforms';

export const communitiesService = {
  createCommunity: async (name, description) => {
    const response = await apiClient.post('/communities/', { name, description });
    return normalizeCommunity(unwrapResponse(response));
  },

  getAllCommunities: async () => {
    const response = await apiClient.get('/communities/');
    return Array.isArray(response) ? response.map(normalizeCommunity) : [];
  },

  getCommunity: async (communityId) => {
    const response = await apiClient.get(`/communities/${communityId}`);
    return normalizeCommunity(response);
  },

  joinCommunity: async (communityId) => {
    return apiClient.post(`/communities/${communityId}/join`, {});
  },

  leaveCommunity: async (communityId) => {
    return apiClient.post(`/communities/${communityId}/leave`, {});
  },

  listMembers: async (communityId) => {
    const response = await apiClient.get(`/communities/${communityId}/members`);
    return Array.isArray(response) ? response.map(normalizeCommunityMember) : [];
  },

  transferCaptaincy: async (communityId, newCaptainUserId) => {
    return apiClient.post(
      `/communities/${communityId}/transfer-captaincy?new_captain_user_id=${newCaptainUserId}`,
      {},
    );
  },

  createCommunityPost: async (communityId, title, content) => {
    const response = await apiClient.post(`/communities/${communityId}/posts`, { title, content });
    return normalizeCommunityPost(unwrapResponse(response));
  },

  listCommunityPosts: async (communityId) => {
    const response = await apiClient.get(`/communities/${communityId}/posts`);
    return Array.isArray(response) ? response.map(normalizeCommunityPost) : [];
  },

  getCommunityPost: async (communityId, postId) => {
    const response = await apiClient.get(`/communities/${communityId}/posts/${postId}`);
    return normalizeCommunityPost(response);
  },

  deleteCommunity: async (communityId) => {
    return apiClient.delete(`/communities/${communityId}`);
  },

  deleteCommunityPost: async (communityId, postId) => {
    return apiClient.delete(`/communities/${communityId}/posts/${postId}`);
  },
};
