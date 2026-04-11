import React from 'react';
import { FileText, Users, MessageCircle, UserCheck, CheckCircle2 } from 'lucide-react';

const CONFIGS = {
  posts: {
    icon: <FileText size={40} />,
    title: 'No posts yet',
    subtitle: 'Be the first to share something with the community!',
  },
  communities: {
    icon: <Users size={40} />,
    title: 'No communities found',
    subtitle: 'Create a new community to get started.',
  },
  messages: {
    icon: <MessageCircle size={40} />,
    title: 'Select a conversation',
    subtitle: 'Choose a conversation or start a new one.',
  },
  members: {
    icon: <UserCheck size={40} />,
    title: 'No members yet',
    subtitle: 'This community is just getting started.',
  },
  reports: {
    icon: <CheckCircle2 size={40} />,
    title: 'No open reports',
    subtitle: 'Everything looks clean. Great moderation work!',
  },
  comments: {
    icon: <MessageCircle size={40} />,
    title: 'No comments yet',
    subtitle: 'Be the first to comment!',
  },
};

export function EmptyState({ type }) {
  const config = CONFIGS[type];
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      opacity: 0.6,
    }}>
      <div style={{ color: '#64748B', marginBottom: 16 }}>{config.icon}</div>
      <p style={{ color: '#F1F5F9', fontWeight: 600, marginBottom: 8, fontSize: 16 }}>{config.title}</p>
      <p style={{ color: '#64748B', textAlign: 'center', maxWidth: 300 }}>{config.subtitle}</p>
    </div>
  );
}
