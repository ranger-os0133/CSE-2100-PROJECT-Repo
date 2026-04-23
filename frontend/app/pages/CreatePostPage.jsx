import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, SendHorizontal } from 'lucide-react';
import { FileChip } from '../components/shared/FileChip';
import { filesService, postsService } from '../services';
import { useToast } from '../store/ToastContext';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { showError, showSuccess, showUpload, upgradeToSuccess } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      showError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const createdPost = await postsService.createPost({
        title: trimmedTitle,
        content: trimmedContent,
        isAnonymous,
      });

      if (selectedFiles.length > 0) {
        await Promise.all(
          selectedFiles.map(async (file) => {
            const toastId = showUpload(file.name);
            await filesService.uploadFile(file, { postId: createdPost.id });
            upgradeToSuccess(toastId);
          }),
        );
      }

      showSuccess('Post created!', 'Your post has been published.');
      navigate('/app');
    } catch (error) {
      showError(error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="panel page-hero">
        <span className="dashboard-badge">Compose post</span>
        <h1>Publish without touching the feed state.</h1>
        <p>This page handles post creation on its own, then sends you back to the feed after success.</p>
      </section>

      <section className="panel" style={{ maxWidth: 820, width: '100%', margin: '0 auto' }}>
        <div className="panel-header" style={{ marginBottom: 20 }}>
          <div>
            <h2>Create post</h2>
            <p>Write your post, attach files if needed, and publish from a dedicated page.</p>
          </div>
          <button className="app-button app-button--ghost" type="button" onClick={() => navigate('/app')}>
            <ArrowLeft size={16} />
            Back to feed
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: '#F8FBFF', fontWeight: 600 }}>Title</span>
            <input
              type="text"
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="Post title"
              className="search-input"
              maxLength={200}
              required
            />
          </label>

          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ color: '#F8FBFF', fontWeight: 600 }}>Content</span>
            <textarea
              value={content}
              onChange={event => setContent(event.target.value)}
              placeholder="What's on your mind?"
              className="search-input"
              rows={8}
              required
              style={{ resize: 'vertical', minHeight: 220 }}
            />
          </label>

          <div style={{ display: 'grid', gap: 10 }}>
            <span style={{ color: '#F8FBFF', fontWeight: 600 }}>Attachments</span>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={event => setSelectedFiles(Array.from(event.target.files || []))}
              style={{ color: '#F1F5F9' }}
            />
            {selectedFiles.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selectedFiles.map(file => (
                  <FileChip
                    key={file.name + file.size}
                    file={file}
                    onDelete={() => setSelectedFiles(previous => previous.filter(item => item !== file))}
                  />
                ))}
              </div>
            )}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#E2E8F0' }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={event => setIsAnonymous(event.target.checked)}
            />
            Post anonymously
          </label>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="app-button app-button--primary" type="submit" disabled={loading}>
              <SendHorizontal size={16} />
              {loading ? 'Publishing...' : 'Publish post'}
            </button>
            <button className="app-button app-button--ghost" type="button" onClick={() => navigate('/app')} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}