import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BrandMark } from '../components/layout/BrandMark';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { postsService, reportsService, votesService } from '../services';
import { ArrowRight, MessageCircle, Plus, Sparkles, Trash2 } from 'lucide-react';
import { FileChip } from '../components/shared/FileChip';
import { VoteScore } from '../components/shared/VoteScore';

export default function FeedPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const { showError, showSuccess } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState({});
  const [ownedPostIds, setOwnedPostIds] = useState([]);

  const applyVoteDelta = (score, currentVote, nextVote) => (score ?? 0) + (nextVote - currentVote);

  const loadPosts = useCallback(async () => {
    setLoading(true);

    try {
      const allPosts = await postsService.getAllPosts();
      const myPosts = currentUser?.id
        ? await postsService.getMyPosts().catch(() => [])
        : [];

      const nextOwnedPostIds = myPosts.map(post => post.id);

      setPosts(allPosts);
      setOwnedPostIds(nextOwnedPostIds);
    } catch (error) {
      showError(error.message || 'Failed to load posts');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, showError]);

  useEffect(() => {
    loadPosts().catch(() => null);
  }, [loadPosts]);

  const handleVote = async (postId, direction) => {
    const currentVote = userVotes[postId] || 0;
    const nextVote = currentVote === direction ? 0 : direction;

    setUserVotes(prev => ({
      ...prev,
      [postId]: nextVote,
    }));

    setPosts(prev => prev.map(post => {
      if (post.id !== postId) {
        return post;
      }

      return {
        ...post,
        score: applyVoteDelta(post.score, currentVote, nextVote),
      };
    }));

    try {
      await votesService.voteOnPost(postId, nextVote);
    } catch (error) {
      setUserVotes(prev => ({
        ...prev,
        [postId]: currentVote,
      }));

      setPosts(prev => prev.map(post => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          score: applyVoteDelta(post.score, nextVote, currentVote),
        };
      }));

      showError(error.message || 'Failed to vote');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await postsService.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      setOwnedPostIds(prev => prev.filter(id => id !== postId));
      showSuccess('Post deleted', 'The post has been removed.');
    } catch (error) {
      showError(error.message || 'Failed to delete post');
    }
  };

  const handleReport = async (postId) => {
    try {
      await reportsService.createReport({ postId, reason: 'Reported from feed' });
      showSuccess('Report submitted', 'The post has been sent for review.');
    } catch (error) {
      showError(error.message || 'Failed to report post');
    }
  };

  if (!currentUser) {
    return (
      <div className="page-shell">
        <div className="panel panel-empty">
          <p>Please log in to view posts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <section className="feed-hero panel">
        <div className="feed-hero__copy">
          <span className="dashboard-badge">
            <Sparkles size={14} />
            Live social channel
          </span>
          <h1>What people are talking about right now.</h1>
          <p>Fresh posts, sharper cards, and cleaner reading flow across the whole feed.</p>
          <div className="feed-hero__meta">
            <span>{posts.length} posts loaded</span>
            <span>{ownedPostIds.length} authored by you</span>
            {currentUser.role === 'admin' && <span>admin access active</span>}
          </div>
        </div>

        <div className="feed-hero__actions">
          <div className="feed-brand-desktop feed-brand-panel">
            <BrandMark compact />
          </div>
          {currentUser.role === 'admin' && (
            <button className="feed-admin-card" onClick={() => navigate('/admin')}>
              <div>
                <strong>Open admin dashboard</strong>
                <span>Review reports, users, and flagged content.</span>
              </div>
              <ArrowRight size={18} />
            </button>
          )}
          <button className="app-button app-button--primary" onClick={() => navigate('/app/create-post')}>
            <Plus size={16} />
            Create Post
          </button>
        </div>
      </section>

      {loading ? (
        <div className="panel panel-empty">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="panel panel-empty">No posts yet.</div>
      ) : (
        <div className="feed-list">
          {posts.map(post => (
            <article key={post.id} className="feed-card">
              <div className="feed-card__layout">
                {/* Voting Section */}
                <div className="feed-card__vote">
                  <VoteScore
                    votes={post.score || 0}
                    userVote={userVotes[post.id] || 0}
                    vertical
                    onUpvote={() => handleVote(post.id, 1)}
                    onDownvote={() => handleVote(post.id, -1)}
                  />
                </div>

                {/* Post Content */}
                <div className="feed-card__content">
                  <h2
                    onClick={() => navigate(`/app/post/${post.id}`)}
                    className="feed-card__title"
                  >
                    {post.title}
                  </h2>
                  <p className="feed-card__excerpt">
                    {post.content && post.content.substring(0, 150)}
                    {post.content && post.content.length > 150 ? '...' : ''}
                  </p>
                  <div className="feed-card__meta">
                    {post.isAnonymous ? (
                      <span>By Anonymous</span>
                    ) : (
                      <button
                        onClick={() => navigate(`/app/u/${encodeURIComponent(post.authorName)}`)}
                        style={{ background: 'transparent', border: 'none', padding: 0, color: '#94A3B8', cursor: 'pointer' }}
                      >
                        By {post.authorName || 'Unknown'}
                      </button>
                    )}
                    <span>•</span>
                    <span>{new Date(post.created_at || post.createdAt).toLocaleDateString()}</span>
                  </div>
                  {post.files?.length > 0 && (
                    <div className="feed-card__files">
                      {post.files.map(file => (
                        <FileChip key={file.id} file={file} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="feed-card__actions">
                  <button
                    onClick={() => navigate(`/app/post/${post.id}`)}
                    className="feed-card__action-button"
                  >
                    <MessageCircle size={18} />
                    <span>{post.commentCount || 0}</span>
                  </button>
                  {ownedPostIds.includes(post.id) ? (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="feed-card__action-button feed-card__action-button--danger"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReport(post.id)}
                      className="feed-card__action-button feed-card__action-button--warn"
                    >
                      Report
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
