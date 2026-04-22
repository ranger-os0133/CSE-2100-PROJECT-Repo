import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AlertTriangle, MessageSquare, PencilLine, Save, SendHorizontal, Trash2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import {
  buildUsersById,
  commentsService,
  filesService,
  postsService,
  reportsService,
  usersService,
  votesService,
} from '../services';
import { FileChip } from '../components/shared/FileChip';
import { VoteScore } from '../components/shared/VoteScore';

export default function SinglePostPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentUser } = useApp();
  const { showError, showSuccess } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [myPostIds, setMyPostIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [postVote, setPostVote] = useState(0);
  const [commentVotes, setCommentVotes] = useState({});
  const [editingPost, setEditingPost] = useState(false);
  const [postForm, setPostForm] = useState({ title: '', content: '' });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const applyVoteDelta = (score, currentVote, nextVote) => (score ?? 0) + (nextVote - currentVote);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        const [postData, allUsers, myPosts] = await Promise.all([
          postsService.getPost(id),
          usersService.getAllUsers().catch(() => []),
          postsService.getMyPosts().catch(() => []),
        ]);

        const usersById = buildUsersById([...(allUsers || []), currentUser].filter(Boolean));
        const [scoreData, rawComments] = await Promise.all([
          votesService.getPostScore(id).catch(() => ({ score: 0 })),
          commentsService.getPostComments(id, usersById).catch(() => []),
        ]);

        const enrichedComments = await Promise.all(
          rawComments.map(async (comment) => {
            const score = await votesService.getCommentScore(comment.id).catch(() => ({ score: 0 }));
            return { ...comment, votes: score.score ?? 0 };
          }),
        );

        setPost({
          ...postData,
          score: scoreData.score ?? 0,
        });
        setPostForm({ title: postData.title, content: postData.content });
        setComments(enrichedComments);
        setMyPostIds(myPosts.map(item => item.id));
      } catch (error) {
        showError(error.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadPost();
    }
  }, [currentUser, id, showError]);

  const canManagePost = myPostIds.includes(Number(id));

  const handlePostVote = async (direction) => {
    const currentVote = postVote;
    const nextVote = currentVote === direction ? 0 : direction;

    setPostVote(nextVote);
    setPost(prev => ({
      ...prev,
      score: applyVoteDelta(prev?.score, currentVote, nextVote),
    }));

    try {
      await votesService.voteOnPost(id, nextVote);
    } catch (error) {
      setPostVote(currentVote);
      setPost(prev => ({
        ...prev,
        score: applyVoteDelta(prev?.score, nextVote, currentVote),
      }));
      showError(error.message || 'Failed to vote on post');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      showError('Comment cannot be empty');
      return;
    }

    setSubmittingComment(true);
    try {
      const newComment = await commentsService.createComment(id, commentText);
      const authorName = currentUser?.username || newComment.authorName;
      setComments(prev => [...prev, { ...newComment, authorName, votes: 0 }]);
      setCommentText('');
      showSuccess('Comment posted!');
    } catch (error) {
      showError(error.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdatePost = async () => {
    try {
      const updated = await postsService.updatePost(id, postForm.title, postForm.content);
      setPost(prev => ({ ...prev, ...updated }));
      setEditingPost(false);
      showSuccess('Post updated', 'Your changes have been saved.');
    } catch (error) {
      showError(error.message || 'Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    try {
      await postsService.deletePost(id);
      showSuccess('Post deleted', 'The post has been removed.');
      navigate('/app');
    } catch (error) {
      showError(error.message || 'Failed to delete post');
    }
  };

  const handleReportPost = async () => {
    try {
      await reportsService.createReport({ postId: Number(id), reason: 'Reported from post detail' });
      showSuccess('Report submitted', 'The post has been sent for review.');
    } catch (error) {
      showError(error.message || 'Failed to report post');
    }
  };

  const handleCommentVote = async (commentId, direction) => {
    const currentVote = commentVotes[commentId] || 0;
    const nextVote = currentVote === direction ? 0 : direction;

    setCommentVotes(prev => ({ ...prev, [commentId]: nextVote }));
    setComments(prev => prev.map(comment => (
      comment.id === commentId
        ? { ...comment, votes: applyVoteDelta(comment.votes, currentVote, nextVote) }
        : comment
    )));

    try {
      await votesService.voteOnComment(commentId, nextVote);
    } catch (error) {
      setCommentVotes(prev => ({ ...prev, [commentId]: currentVote }));
      setComments(prev => prev.map(comment => (
        comment.id === commentId
          ? { ...comment, votes: applyVoteDelta(comment.votes, nextVote, currentVote) }
          : comment
      )));
      showError(error.message || 'Failed to vote on comment');
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  };

  const handleSaveComment = async (commentId) => {
    try {
      const updated = await commentsService.updateComment(commentId, editingCommentText);
      setComments(prev => prev.map(comment => (
        comment.id === commentId ? { ...comment, content: updated.content } : comment
      )));
      setEditingCommentId(null);
      setEditingCommentText('');
      showSuccess('Comment updated', 'Your comment has been edited.');
    } catch (error) {
      showError(error.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      showSuccess('Comment deleted', 'The comment has been removed.');
    } catch (error) {
      showError(error.message || 'Failed to delete comment');
    }
  };

  const handleReportComment = async (commentId) => {
    try {
      await reportsService.createReport({ commentId, reason: 'Reported from post detail' });
      showSuccess('Report submitted', 'The comment has been sent for review.');
    } catch (error) {
      showError(error.message || 'Failed to report comment');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await filesService.deleteFile(fileId);
      setPost(prev => ({
        ...prev,
        files: (prev.files || []).filter(file => file.id !== fileId),
      }));
      showSuccess('File deleted', 'The attachment has been removed.');
    } catch (error) {
      showError(error.message || 'Failed to delete file');
    }
  };

  if (!currentUser) {
    return <div className="page-shell"><div className="panel panel-empty">Please log in to view posts.</div></div>;
  }

  if (loading) return <div className="page-shell"><div className="panel panel-empty">Loading post...</div></div>;
  if (!post) return <div className="page-shell"><div className="panel panel-empty">Post not found.</div></div>;

  return (
    <div className="page-shell single-post-shell">
      <section className="panel page-hero single-post-hero">
        <span className="dashboard-badge">
          <MessageSquare size={14} />
          Post detail
        </span>
        <h1>{post.title}</h1>
        <p>Read the full thread, manage your post, and keep the conversation moving without the old crowded layout.</p>
      </section>

      <section className="panel single-post-card">
        {editingPost ? (
          <div className="single-post-editor">
            <input
              value={postForm.title}
              onChange={e => setPostForm(prev => ({ ...prev, title: e.target.value }))}
              className="search-input"
            />
            <textarea
              value={postForm.content}
              onChange={e => setPostForm(prev => ({ ...prev, content: e.target.value }))}
              className="search-input single-post-editor__textarea"
            />
          </div>
        ) : (
          <>
            <div className="single-post-content">{post.content}</div>
          </>
        )}
        <div className="single-post-toolbar">
          <VoteScore
            votes={post.score || 0}
            userVote={postVote}
            onUpvote={() => handlePostVote(1)}
            onDownvote={() => handlePostVote(-1)}
          />
          {canManagePost ? (
            <div className="single-post-toolbar__actions">
              <button className="app-button app-button--ghost" onClick={() => setEditingPost(prev => !prev)}>
                <PencilLine size={16} />
                {editingPost ? 'Cancel Edit' : 'Edit Post'}
              </button>
              {editingPost && (
                <button className="app-button app-button--primary" onClick={handleUpdatePost}>
                  <Save size={16} />
                  Save Changes
                </button>
              )}
              <button className="app-button app-button--danger" onClick={handleDeletePost}>
                <Trash2 size={16} />
                Delete Post
              </button>
            </div>
          ) : (
            <button className="app-button app-button--ghost" onClick={handleReportPost}>
              <AlertTriangle size={16} />
              Report Post
            </button>
          )}
        </div>
        {post.files?.length > 0 && (
          <div className="profile-files-wrap">
            {post.files.map(file => (
              <FileChip
                key={file.id}
                file={file}
                onDelete={canManagePost ? () => handleDeleteFile(file.id) : undefined}
              />
            ))}
          </div>
        )}
        <div className="single-post-meta">
          By {post.isAnonymous ? 'Anonymous' : (
            <button
              onClick={() => navigate(`/app/u/${encodeURIComponent(post.authorName)}`)}
              className="community-link-button"
            >
              {post.authorName}
            </button>
          )} • {new Date(post.createdAt).toLocaleDateString()} • {post.score || 0} votes
        </div>
      </section>

      <section className="panel single-post-comments">
        <div className="panel-header">
          <div>
            <h2>Comments ({comments.length})</h2>
            <p>Join the discussion below.</p>
          </div>
        </div>

        <form className="single-post-comment-form" onSubmit={handlePostComment}>
          <textarea
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="search-input single-post-editor__textarea"
          />
          <button className="app-button app-button--primary" type="submit" disabled={submittingComment}>
            <SendHorizontal size={16} />
            {submittingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        <div className="single-post-comment-list">
          {comments.map(comment => (
            <article key={comment.id} className="single-post-comment-card">
              <div className="single-post-comment-card__main">
                <div>
                  <div className="single-post-comment-card__author">
                    <button
                      onClick={() => navigate(`/app/u/${encodeURIComponent(comment.authorName)}`)}
                      className="community-link-button"
                    >
                      {comment.authorName}
                    </button>
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="single-post-comment-card__editor">
                      <textarea
                        value={editingCommentText}
                        onChange={e => setEditingCommentText(e.target.value)}
                        className="search-input single-post-editor__textarea"
                      />
                      <div className="community-card__actions">
                        <button className="app-button app-button--primary" onClick={() => handleSaveComment(comment.id)} type="button">Save</button>
                        <button className="app-button app-button--ghost" onClick={() => setEditingCommentId(null)} type="button">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="single-post-comment-card__content">{comment.content}</div>
                  )}
                  <div className="single-post-comment-card__meta">
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    <span>{comment.votes || 0} votes</span>
                  </div>
                </div>
                <div className="single-post-comment-card__actions">
                  <VoteScore
                    votes={comment.votes || 0}
                    userVote={commentVotes[comment.id] || 0}
                    vertical
                    size="sm"
                    onUpvote={() => handleCommentVote(comment.id, 1)}
                    onDownvote={() => handleCommentVote(comment.id, -1)}
                  />
                  {comment.authorId === currentUser?.id ? (
                    <>
                      <button className="app-button app-button--ghost" onClick={() => handleStartEditComment(comment)} type="button">Edit</button>
                      <button className="app-button app-button--danger" onClick={() => handleDeleteComment(comment.id)} type="button">Delete</button>
                    </>
                  ) : (
                    <button className="app-button app-button--ghost" onClick={() => handleReportComment(comment.id)} type="button">Report</button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
