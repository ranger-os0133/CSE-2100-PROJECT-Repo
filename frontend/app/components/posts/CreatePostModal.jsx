import React, { useState } from 'react';
import { useToast } from '../../store/ToastContext';
import { communitiesService, filesService, postsService } from '../../services';
import { X } from 'lucide-react';
import { FileChip } from '../shared/FileChip';

export function CreatePostModal({ isOpen, onClose, communityId, onCreated }) {
  const { showSuccess, showError, showUpload, upgradeToSuccess } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setIsAnonymous(false);
    setSelectedFiles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      showError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      let createdPost = null;

      if (communityId) {
        createdPost = await communitiesService.createCommunityPost(communityId, trimmedTitle, trimmedContent);
      } else {
        createdPost = await postsService.createPost({
          title: trimmedTitle,
          content: trimmedContent,
          isAnonymous,
        });
      }

      let uploadedFiles = [];
      if (!communityId && selectedFiles.length > 0) {
        uploadedFiles = await Promise.all(
          selectedFiles.map(async (file) => {
            const toastId = showUpload(file.name);
            const uploaded = await filesService.uploadFile(file, { postId: createdPost.id });
            upgradeToSuccess(toastId);
            return uploaded;
          }),
        );
      }

      const postWithFiles = {
        ...createdPost,
        files: [...(createdPost.files || []), ...uploadedFiles],
      };

      await onCreated?.(postWithFiles);
      showSuccess('Post created!', 'Your post has been published.');
      resetForm();
      onClose();
    } catch (error) {
      showError(error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 50,
    }}>
      <div style={{
        background: '#1A1D27', borderRadius: 12, padding: '24px', width: '90%',
        maxWidth: 500, border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#F1F5F9', fontSize: '18px', fontWeight: 600 }}>Create Post</h2>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', background: '#252D3D', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#F1F5F9', marginBottom: 12, fontFamily: 'inherit',
            }}
            required
          />

          <textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{
              width: '100%', padding: '12px 16px', background: '#252D3D', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#F1F5F9', marginBottom: 12, minHeight: 120, fontFamily: 'inherit',
            }}
            required
          />

          {!communityId && (
            <div style={{ marginBottom: 12 }}>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={e => setSelectedFiles(Array.from(e.target.files || []))}
                style={{ color: '#F1F5F9', marginBottom: 12 }}
              />
              {selectedFiles.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedFiles.map(file => (
                    <FileChip key={file.name + file.size} file={file} onDelete={() => {
                      setSelectedFiles(prev => prev.filter(item => item !== file));
                    }} />
                  ))}
                </div>
              )}
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
              style={{ cursor: 'pointer' }}
              disabled={Boolean(communityId)}
            />
            <span style={{ color: '#F1F5F9' }}>
              {communityId ? 'Anonymous posting is not supported for community posts' : 'Post anonymously'}
            </span>
          </label>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: '12px 16px', background: '#6C63FF', border: 'none',
                borderRadius: 8, color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#F1F5F9', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
