import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Crown, FileText, LogOut, Save, Trash2, Upload, UserRound } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { authService, communitiesService, filesService, postsService, usersService } from '../services';
import { FileChip } from '../components/shared/FileChip';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, setIsAuthenticated, setCurrentUser } = useApp();
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(currentUser);
  const [stats, setStats] = useState({ posts: 0, communitiesLed: 0, uploads: 0 });
  const [myPosts, setMyPosts] = useState([]);
  const [myFiles, setMyFiles] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) {
        return;
      }

      setLoading(true);
      try {
        const [user, posts, files, communities] = await Promise.all([
          usersService.getCurrentUser(),
          postsService.getMyPosts(),
          filesService.getUserFiles(currentUser.id),
          communitiesService.getAllCommunities().catch(() => []),
        ]);

        setProfile(user);
        setCurrentUser(user);
        setMyPosts(posts);
        setMyFiles(files);
        setStats({
          posts: posts.length,
          communitiesLed: communities.filter(community => community.captainId === user.id).length,
          uploads: files.length,
        });
      } catch (error) {
        showError(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser, setCurrentUser, showError]);

  const handleSaveProfile = async () => {
    if (!profile?.username?.trim() || !profile?.email?.trim()) {
      showError('Username and email are required');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await usersService.updateCurrentUser({
        username: profile.username,
        email: profile.email,
      }, currentUser.id);
      setProfile(updatedUser);
      setCurrentUser(updatedUser);
      showSuccess('Profile updated', 'Your account details are saved.');
    } catch (error) {
      showError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Delete your account permanently?');
    if (!confirmed) {
      return;
    }

    try {
      await usersService.deleteCurrentUser(currentUser.id);
      authService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      navigate('/auth');
    } catch (error) {
      showError(error.message || 'Failed to delete account');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    showSuccess('Logged out', 'See you next time!');
    navigate('/');
  };

  const handleDeletePost = async (postId) => {
    try {
      await postsService.deletePost(postId);
      setMyPosts(prev => prev.filter(post => post.id !== postId));
      setStats(prev => ({ ...prev, posts: Math.max(prev.posts - 1, 0) }));
      showSuccess('Post deleted');
    } catch (error) {
      showError(error.message || 'Failed to delete post');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await filesService.deleteFile(fileId);
      setMyFiles(prev => prev.filter(file => file.id !== fileId));
      setStats(prev => ({ ...prev, uploads: Math.max(prev.uploads - 1, 0) }));
      showSuccess('File deleted');
    } catch (error) {
      showError(error.message || 'Failed to delete file');
    }
  };

  if (!currentUser) {
    return (
      <div className="page-shell">
        <div className="panel panel-empty">Please log in to view your profile.</div>
      </div>
    );
  }

  if (loading && !profile) {
    return <div className="page-shell"><div className="panel panel-empty">Loading profile...</div></div>;
  }

  return (
    <div className="page-shell profile-shell">
      <section className="panel page-hero profile-hero">
        <span className="dashboard-badge">
          <UserRound size={14} />
          Account center
        </span>
        <h1>{profile?.username}</h1>
        <p>Update your account details, track your activity, and manage your content from one cleaner control surface.</p>
      </section>

      <section className="panel profile-summary-card">
        <div className="profile-summary-card__identity">
          <div className="profile-avatar-large">{currentUser.username?.charAt(0).toUpperCase()}</div>
          <div>
            <h2>{profile?.username}</h2>
            <p>{profile?.email}</p>
          </div>
        </div>
        <div className="profile-stat-grid">
          <article className="profile-stat-card">
            <FileText size={18} />
            <strong>{stats.posts}</strong>
            <span>Posts</span>
          </article>
          <article className="profile-stat-card">
            <Crown size={18} />
            <strong>{stats.communitiesLed}</strong>
            <span>Communities Led</span>
          </article>
          <article className="profile-stat-card">
            <Upload size={18} />
            <strong>{stats.uploads}</strong>
            <span>Uploads</span>
          </article>
        </div>
      </section>

      <section className="panel profile-editor-card">
        <div className="panel-header">
          <div>
            <h2>Edit profile</h2>
            <p>Keep the basics accurate so people can find you.</p>
          </div>
        </div>
        <div className="profile-editor-grid">
          <input
            type="text"
            value={profile?.username || ''}
            onChange={e => setProfile(prev => ({ ...prev, username: e.target.value }))}
            className="search-input"
          />
          <input
            type="email"
            value={profile?.email || ''}
            onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
            className="search-input"
          />
        </div>
        <div className="profile-editor-actions">
          <button className="app-button app-button--primary" onClick={handleSaveProfile} disabled={saving || loading}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </section>

      <section className="panel profile-section-card">
        <div className="panel-header">
          <div>
            <h2>My posts</h2>
            <p>Your recent publishing activity.</p>
          </div>
        </div>
        {myPosts.length === 0 ? (
          <div className="panel-empty">No posts yet.</div>
        ) : (
          <div className="profile-content-list">
            {myPosts.map(post => (
              <article key={post.id} className="profile-content-item">
                <div>
                  <strong>{post.title}</strong>
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                </div>
                <button className="app-button app-button--danger" onClick={() => handleDeletePost(post.id)}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel profile-section-card">
        <div className="panel-header">
          <div>
            <h2>Uploaded files</h2>
            <p>Attachments you can still manage.</p>
          </div>
        </div>
        {myFiles.length === 0 ? (
          <div className="panel-empty">No uploaded files.</div>
        ) : (
          <div className="profile-files-wrap">
            {myFiles.map(file => (
              <FileChip key={file.id} file={file} onDelete={() => handleDeleteFile(file.id)} />
            ))}
          </div>
        )}
      </section>

      <section className="panel profile-danger-zone">
        <button className="app-button app-button--danger app-button--wide" onClick={handleLogout}>
          <LogOut size={16} />
          Log Out
        </button>
        <button className="app-button app-button--ghost app-button--wide" onClick={handleDeleteAccount}>
          <Trash2 size={16} />
          Delete Account
        </button>
      </section>
    </div>
  );
}
