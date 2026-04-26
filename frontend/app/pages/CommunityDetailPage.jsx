import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Crown, Plus, ShieldCheck, Users } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { communitiesService, usersService } from '../services';
import { CreatePostModal } from '../components/posts/CreatePostModal';
import { EmptyState } from '../components/shared/EmptyState';

export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const { showError, showSuccess } = useToast();
  const [community, setCommunity] = useState(null);
  const [captain, setCaptain] = useState(null);
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCaptainId, setSelectedCaptainId] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const communityData = await communitiesService.getCommunity(id);
        setCommunity(communityData);

        const captainData = await usersService.getUser(communityData.captainId).catch(() => null);
        setCaptain(captainData);

        try {
          const [memberData, postData] = await Promise.all([
            communitiesService.listMembers(id),
            communitiesService.listCommunityPosts(id),
          ]);
          setMembers(memberData);
          setPosts(postData);
          setIsMember(true);
          const transferTarget = memberData.find(member => member.userId !== communityData.captainId);
          setSelectedCaptainId(transferTarget ? String(transferTarget.userId) : '');
        } catch (membershipError) {
          if (membershipError.message?.toLowerCase().includes('member')) {
            setMembers([]);
            setPosts([]);
            setIsMember(false);
          } else {
            throw membershipError;
          }
        }
      } catch (error) {
        showError(error.message || 'Failed to load community');
      } finally {
        setLoading(false);
      }
    };
    if (id) loadData();
  }, [id, showError]);

  const isCaptain = currentUser?.id === community?.captainId;

  const handleJoin = async () => {
    try {
      await communitiesService.joinCommunity(id);
      const [memberData, postData] = await Promise.all([
        communitiesService.listMembers(id),
        communitiesService.listCommunityPosts(id),
      ]);
      setMembers(memberData);
      setPosts(postData);
      setIsMember(true);
      showSuccess('Joined community!');
    } catch (error) {
      showError(error.message || 'Failed to join community');
    }
  };

  const handleLeave = async () => {
    try {
      await communitiesService.leaveCommunity(id);
      setMembers([]);
      setPosts([]);
      setIsMember(false);
      showSuccess('Left community');
    } catch (error) {
      showError(error.message || 'Failed to leave community');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await communitiesService.deleteCommunityPost(id, postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      showSuccess('Community post deleted');
    } catch (error) {
      showError(error.message || 'Failed to delete community post');
    }
  };

  const handleTransferCaptaincy = async () => {
    try {
      await communitiesService.transferCaptaincy(id, selectedCaptainId);
      setCommunity(prev => ({ ...prev, captainId: Number(selectedCaptainId) }));
      const newCaptain = members.find(member => member.userId === Number(selectedCaptainId));
      if (newCaptain) {
        setCaptain({ id: newCaptain.userId, username: newCaptain.username });
      }
      showSuccess('Captaincy transferred');
    } catch (error) {
      showError(error.message || 'Failed to transfer captaincy');
    }
  };

  const handleDeleteCommunity = async () => {
    try {
      await communitiesService.deleteCommunity(id);
      showSuccess('Community deleted');
      navigate('/app/communities');
    } catch (error) {
      showError(error.message || 'Failed to delete community');
    }
  };

  const handleCommunityPostCreated = async (createdPost) => {
    try {
      const refreshedPosts = await communitiesService.listCommunityPosts(id);
      setPosts(refreshedPosts);
    } catch {
      setPosts(prev => prev.some(post => post.id === createdPost?.id) ? prev : [createdPost, ...prev]);
    }
  };

  const handleOpenPost = async (postId) => {
    try {
      const post = await communitiesService.getCommunityPost(id, postId);
      setSelectedPost(post);
    } catch (error) {
      showError(error.message || 'Failed to load community post');
    }
  };

  if (!currentUser) {
    return <div className="page-shell"><div className="panel panel-empty">Please log in to view communities.</div></div>;
  }

  if (loading) return <div className="page-shell"><div className="panel panel-empty">Loading community...</div></div>;
  if (!community) return <div className="page-shell"><div className="panel panel-empty">Community not found.</div></div>;

  return (
    <div className="page-shell community-detail-shell">
      <section className="panel community-detail-hero">
        <span className="dashboard-badge">
          <Users size={14} />
          Community detail
        </span>
        <h1>{community.name}</h1>
        <p>{community.description}</p>
        <div className="community-detail-hero__meta">
          <div>
            <span>Captain</span>
            <button
              onClick={() => captain?.username && navigate(`/app/u/${encodeURIComponent(captain.username)}`)}
              className="community-link-button"
            >
              {captain?.username || `User #${community.captainId}`}
            </button>
          </div>
          <div>
            <span>Members</span>
            <strong>{community.memberCount}</strong>
          </div>
        </div>
        <div className="community-detail-hero__actions">
          {!isMember ? (
            <button className="app-button app-button--success" onClick={handleJoin}><Users size={16} />Join Community</button>
          ) : (
            <>
              <button className="app-button app-button--primary" onClick={() => setShowCreateModal(true)}><Plus size={16} />Create Community Post</button>
              {!isCaptain && (
                <button className="app-button app-button--ghost" onClick={handleLeave}>Leave Community</button>
              )}
            </>
          )}
          {isCaptain && (
            <button className="app-button app-button--danger" onClick={handleDeleteCommunity}>Delete Community</button>
          )}
        </div>
      </section>

      {isMember && (
        <section className="panel community-detail-section">
          <div className="panel-header">
            <div>
              <h2>Members</h2>
              <p>Everyone inside this community.</p>
            </div>
          </div>
          <div className="community-member-list">
            {members.map(member => (
              <button
                key={member.userId}
                onClick={() => navigate(`/app/u/${encodeURIComponent(member.username)}`)}
                className={`community-member-chip ${member.role === 'captain' ? 'is-captain' : ''}`}
              >
                {member.role === 'captain' && <Crown size={14} />}
                {member.username} · {member.role}
              </button>
            ))}
          </div>
          {isCaptain && members.some(member => member.userId !== community.captainId) && (
            <div className="community-transfer-box">
              <select value={selectedCaptainId} onChange={e => setSelectedCaptainId(e.target.value)} className="search-input">
                {members.filter(member => member.userId !== community.captainId).map(member => (
                  <option key={member.userId} value={member.userId}>{member.username}</option>
                ))}
              </select>
              <button className="app-button app-button--success" onClick={handleTransferCaptaincy}><ShieldCheck size={16} />Transfer Captaincy</button>
            </div>
          )}
        </section>
      )}

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        communityId={community?.id}
        onCreated={handleCommunityPostCreated}
      />

      {selectedPost && (
        <section className="panel community-detail-preview">
          <div className="panel-header">
            <div>
              <h2>{selectedPost.title}</h2>
              <p>Community post preview</p>
            </div>
            <button className="app-button app-button--ghost" onClick={() => setSelectedPost(null)}>Close</button>
          </div>
          <div className="community-detail-preview__content">{selectedPost.content}</div>
          <div className="community-detail-preview__meta">
            <button onClick={() => navigate(`/app/u/${encodeURIComponent(selectedPost.authorName)}`)} className="community-link-button">{selectedPost.authorName}</button> • {new Date(selectedPost.createdAt).toLocaleString()}
          </div>
        </section>
      )}

      <section className="panel community-detail-section">
        <div className="panel-header">
          <div>
            <h2>Posts</h2>
            <p>Shared inside this community.</p>
          </div>
        </div>

        {!isMember ? (
          <div className="panel-empty">Join this community to view its members and posts.</div>
        ) : posts.length === 0 ? (
          <EmptyState type="posts" />
        ) : (
          <div className="community-post-list">
            {posts.map(post => (
              <article key={post.id} className="community-post-card">
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                  <div className="community-detail-preview__meta">
                    <button onClick={() => navigate(`/app/u/${encodeURIComponent(post.authorName)}`)} className="community-link-button">By {post.authorName}</button> • {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="community-card__actions">
                  <button className="app-button app-button--ghost" onClick={() => handleOpenPost(post.id)}>View</button>
                  {(post.authorId === currentUser?.id || isCaptain) && (
                    <button className="app-button app-button--danger" onClick={() => handleDeletePost(post.id)}>Delete</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
