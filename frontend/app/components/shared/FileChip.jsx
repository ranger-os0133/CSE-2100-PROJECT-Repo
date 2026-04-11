import React, { useEffect, useState } from 'react';
import { Download, Trash2 } from 'lucide-react';

export function FileChip({ file, onDelete }) {
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');

  useEffect(() => {
    if (file?.fileUrl) {
      setLocalPreviewUrl(file.fileUrl);
      return undefined;
    }

    if (file instanceof File) {
      const objectUrl = URL.createObjectURL(file);
      setLocalPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setLocalPreviewUrl('');
    return undefined;
  }, [file]);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const extension = (file?.name ?? '').split('.').pop()?.toLowerCase() ?? '';
  const isImage = file?.isImage ?? ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  const isVideo = file?.isVideo ?? ['mp4', 'webm', 'mov'].includes(extension);
  const canPreview = Boolean(localPreviewUrl) && (isImage || isVideo);
  const canOpen = Boolean(localPreviewUrl);

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      background: 'rgba(108,99,255,0.1)',
      border: '1px solid rgba(108,99,255,0.3)',
      borderRadius: 6,
      maxWidth: '100%',
    }}>
      {canPreview ? (
        <button
          type="button"
          onClick={() => window.open(localPreviewUrl, '_blank', 'noopener,noreferrer')}
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
        >
          {isImage ? (
            <img
              src={localPreviewUrl}
              alt={file.name}
              style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, display: 'block' }}
            />
          ) : (
            <video
              src={localPreviewUrl}
              style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 6, display: 'block' }}
              muted
            />
          )}
        </button>
      ) : (
        <Download size={14} color="#6C63FF" />
      )}
      <div style={{ fontSize: '13px', color: '#F1F5F9' }}>
        <div style={{ fontWeight: 600 }}>{file.name}</div>
        <div style={{ fontSize: '11px', color: '#64748B' }}>{formatBytes(file.size)}</div>
        {canOpen && !canPreview && (
          <button
            type="button"
            onClick={() => window.open(localPreviewUrl, '_blank', 'noopener,noreferrer')}
            style={{ marginTop: 4, padding: 0, background: 'transparent', border: 'none', color: '#6C63FF', cursor: 'pointer', fontSize: '11px' }}
          >
            Open file
          </button>
        )}
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

export function FileCard({ file, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        background: '#252D3D',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#2A3042';
        e.currentTarget.style.borderColor = 'rgba(108,99,255,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = '#252D3D';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      <div style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{file.name}</div>
      <div style={{ color: '#64748B', fontSize: 12 }}>
        {(file.size / 1024).toFixed(1)} KB
      </div>
    </div>
  );
}
