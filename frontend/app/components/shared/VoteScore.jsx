import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function VoteScore({ votes, userVote, onUpvote, onDownvote, vertical = false, size = 'md' }) {
  const iconSize = size === 'sm' ? 14 : 16;
  const textSize = size === 'sm' ? 12 : 13;

  return (
    <div style={{
      display: 'flex',
      flexDirection: vertical ? 'column' : 'row',
      alignItems: 'center',
      gap: vertical ? 4 : 6,
    }}>
      <button
        onClick={(e) => { e.stopPropagation(); onUpvote(); }}
        style={{
          background: userVote === 1 ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${userVote === 1 ? '#22C55E' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 6,
          padding: '4px 6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: userVote === 1 ? '#22C55E' : '#64748B',
          boxShadow: userVote === 1 ? '0 0 10px rgba(34,197,94,0.3)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        <ChevronUp size={iconSize} />
      </button>

      <span style={{
        color: userVote === 1 ? '#22C55E' : userVote === -1 ? '#EF4444' : '#F1F5F9',
        fontWeight: 600,
        fontSize: textSize,
        minWidth: 20,
        textAlign: 'center',
        transition: 'color 0.2s',
      }}>
        {votes > 999 ? `${(votes / 1000).toFixed(1)}k` : votes}
      </span>

      <button
        onClick={(e) => { e.stopPropagation(); onDownvote(); }}
        style={{
          background: userVote === -1 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${userVote === -1 ? '#EF4444' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 6,
          padding: '4px 6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: userVote === -1 ? '#EF4444' : '#64748B',
          boxShadow: userVote === -1 ? '0 0 10px rgba(239,68,68,0.3)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        <ChevronDown size={iconSize} />
      </button>
    </div>
  );
}
