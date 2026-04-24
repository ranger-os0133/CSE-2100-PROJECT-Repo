import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { MessageCircle, MoreHorizontal, Flag, Trash2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { useToast } from '../../store/ToastContext';
import { VoteScore } from '../shared/VoteScore';

export function PostCard({ post, onEdit, compact = false }) {
  const navigate = useNavigate();
  const { deletePost, reportContent, currentUser } = useApp();
  const { showSuccess, showError } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const isOwner = post.authorId === currentUser?.id;

  const handleDelete = () => {
    try {
      deletePost(post.id);
      showSuccess('Post deleted', 'Your post has been removed.');
    } catch (error) {
      showError('Failed to delete post');
    }
    setMenuOpen(false);
  };

  const handleReport = () => {
    try {
      reportContent('post', post.id, 'Reported by user');
      showSuccess('Report submitted', 'Our team will review this post.');
    } catch (error) {
      showError('Failed to report post');
    }
    setMenuOpen(false);
  };

  return (
    <div
      onClick={() => navigate(`/post/${post.id}`)}
      style={{
        background: '#1A1D27',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.06)',
        padding: '18px 20px',
        display: 'flex',
        gap: 16,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(108,99,255,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Vote column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <VoteScore
          votes={post.votes}
          userVote={post.userVote || 0}
          vertical
          onUpvote={() => {}}
          onDownvote={() => {}}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(108,99,255,0.2)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#F1F5F9' }}>
              {post.anonymous ? 'Anonymous' : post.authorName}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <h3 style={{ color: '#F1F5F9', marginBottom: 8, fontWeight: 600 }}>{post.title}</h3>
        <p style={{ color: '#94A3B8', marginBottom: 12, lineHeight: 1.5 }}>
          {post.content.substring(0, 200)}...
        </p>

        <div style={{ display: 'flex', gap: 8, color: '#64748B', fontSize: '12px' }}>
          <MessageCircle size={14} />
          {post.comments?.length || 0} comments
        </div>
      </div>

      {/* Menu */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
        >
          <MoreHorizontal size={18} />
        </button>
        {menuOpen && (
          <div style={{ position: 'absolute', right: 0, top: 24, background: '#252D3D', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', zIndex: 10 }}>
            {isOwner && (
              <button
                onClick={e => { e.stopPropagation(); handleDelete(); }}
                style={{ width: '100%', padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '14px', textAlign: 'left' }}
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); handleReport(); }}
              style={{ width: '100%', padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#F1F5F9', fontSize: '14px', textAlign: 'left' }}
            >
              <Flag size={14} /> Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
