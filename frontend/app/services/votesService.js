import { apiClient } from './api';

function toVoteType(voteType) {
  if (voteType === 1) {
    return 'upvote';
  }
  if (voteType === -1) {
    return 'downvote';
  }
  return null;
}

export const votesService = {
  voteOnPost: async (postId, voteType) => {
    if (voteType === 0) {
      return apiClient.delete(`/votes/post/${postId}`);
    }

    return apiClient.post(`/votes/post/${postId}`, {
      vote_type: toVoteType(voteType),
    });
  },

  getPostScore: async (postId) => {
    return apiClient.get(`/votes/post/${postId}/score`);
  },

  voteOnComment: async (commentId, voteType) => {
    if (voteType === 0) {
      return apiClient.delete(`/votes/comment/${commentId}`);
    }

    return apiClient.post(`/votes/comment/${commentId}`, {
      vote_type: toVoteType(voteType),
    });
  },

  getCommentScore: async (commentId) => {
    return apiClient.get(`/votes/comment/${commentId}/score`);
  },
};
