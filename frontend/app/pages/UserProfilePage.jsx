import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { CalendarDays, FileText, MessageSquareMore, Upload, UserRound } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { filesService, postsService, usersService } from '../services';
import { FileChip } from '../components/shared/FileChip';
import { EmptyState } from '../components/shared/EmptyState';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { currentUser } = useApp();
  const { showError } = useToast();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const profile = await usersService.getUserByUsername(username);
        const [authorPosts, uploadedFiles] = await Promise.all([
          postsService.getPostsByAuthor(profile.id).catch(() => []),
          filesService.getUserFiles(profile.id).catch(() => []),
        ]);
        setUser(profile);
        setPosts(authorPosts);
        setFiles(uploadedFiles);
      } catch (error) {
        showError(error.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      loadProfile();
    }
  }, [showError, username]);

  if (!currentUser) {
    return <div className="page-shell"><div className="panel panel-empty">Please log in to view profiles.</div></div>;
  }

  if (loading) {
    return <div className="page-shell"><div className="panel panel-empty">Loading profile...</div></div>;
  }

  if (!user) {
    return <div className="page-shell"><div className="panel panel-empty">User not found.</div></div>;
  }

  return (
    <div className="page-shell profile-shell">
      <section className="panel page-hero profile-hero">
        <span className="dashboard-badge">
          <UserRound size={14} />
          Public profile
        </span>
        <h1>{user.username}</h1>
        <p>See recent posts, uploads, and account activity with the same polished presentation as the rest of the app.</p>
      </section>

      <section className="panel user-profile-summary">
        <div className="profile-summary-card__identity">
          <div className="profile-avatar-large">{user.username.charAt(0).toUpperCase()}</div>
          <div>
            <h2>{user.username}</h2>
            <p>{user.email}</p>
          </div>
        </div>
        <div className="user-profile-stats">
          <span><FileText size={16} />{posts.length} posts</span>
          <span><Upload size={16} />{files.length} uploads</span>
          <span><CalendarDays size={16} />Joined {new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
        {currentUser.id !== user.id && (
          <button className="app-button app-button--primary" onClick={() => navigate(`/app/messages?user=${user.id}`)}>
            <MessageSquareMore size={16} />
            Message User
          </button>
        )}
      </section>

      <section className="panel profile-section-card">
        <div className="panel-header">
          <div>
            <h2>Posts</h2>
            <p>Recent writing from this user.</p>
          </div>
        </div>
        {posts.length === 0 ? (
          <EmptyState type="posts" />
        ) : (
          <div className="profile-content-list">
            {posts.map(post => (
              <button
                key={post.id}
                onClick={() => navigate(`/app/post/${post.id}`)}
                className="user-profile-post-card"
              >
                <strong>{post.title}</strong>
                <p>{post.content.slice(0, 180)}{post.content.length > 180 ? '...' : ''}</p>
                <span>{new Date(post.createdAt).toLocaleString()}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="panel profile-section-card">
        <div className="panel-header">
          <div>
            <h2>Uploads</h2>
            <p>Shared files and attachments.</p>
          </div>
        </div>
        {files.length === 0 ? (
          <div className="panel-empty">No uploads yet.</div>
        ) : (
          <div className="profile-files-wrap">
            {files.map(file => (
              <FileChip key={file.id} file={file} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}