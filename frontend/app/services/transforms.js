export function unwrapResponse(response) {
  if (response && typeof response === 'object' && 'data' in response) {
    return response.data;
  }
  return response;
}

export function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    isActive: user.is_active ?? user.isActive ?? true,
    role: user.role ?? 'user',
    createdAt: user.created_at ?? user.createdAt ?? null,
  };
}

export function normalizeFile(file) {
  if (!file) {
    return null;
  }

  const rawPath = file.file_path ?? file.filePath ?? '';
  const normalizedPath = String(rawPath).replace(/\\/g, '/').replace(/^\/+/, '');
  const rawUrl = file.file_url ?? file.fileUrl ?? rawPath;
  const hasAbsoluteUrl = /^https?:\/\//i.test(String(rawUrl));
  const fileUrl = hasAbsoluteUrl
    ? String(rawUrl)
    : (normalizedPath
      ? `${window.location.protocol}//${window.location.hostname}:8000/${normalizedPath}`
      : '');
  const extension = (file.filename ?? file.name ?? '').split('.').pop()?.toLowerCase() ?? '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  const isVideo = ['mp4', 'webm', 'mov'].includes(extension);

  return {
    ...file,
    name: file.filename ?? file.name ?? 'File',
    size: file.file_size ?? file.size ?? 0,
    filePath: normalizedPath,
    file_url: file.file_url ?? file.fileUrl ?? fileUrl,
    fileUrl,
    isImage,
    isVideo,
    createdAt: file.created_at ?? file.createdAt ?? null,
  };
}

export function normalizePost(post) {
  if (!post) {
    return null;
  }

  const files = Array.isArray(post.files) ? post.files.map(normalizeFile).filter(Boolean) : [];
  const authorName = post.display_name ?? post.authorName ?? 'Unknown';

  return {
    ...post,
    files,
    authorName,
    displayName: authorName,
    anonymous: post.is_anonymous ?? post.anonymous ?? authorName === 'shadowyfig',
    isAnonymous: post.is_anonymous ?? post.isAnonymous ?? authorName === 'shadowyfig',
    createdAt: post.created_at ?? post.createdAt ?? null,
    score: post.score ?? 0,
    commentCount: post.comment_count ?? post.commentCount ?? 0,
  };
}

export function normalizeComment(comment, usersById = {}) {
  if (!comment) {
    return null;
  }

  const author = usersById[comment.owner_id] ?? null;
  return {
    ...comment,
    authorId: comment.owner_id ?? comment.authorId ?? null,
    authorName: comment.authorName ?? author?.username ?? `User #${comment.owner_id}`,
    createdAt: comment.created_at ?? comment.createdAt ?? null,
    votes: comment.score ?? comment.votes ?? 0,
  };
}

export function normalizeCommunity(community) {
  if (!community) {
    return null;
  }

  return {
    ...community,
    captainId: community.captain_id ?? community.captainId ?? null,
    memberCount: community.member_count ?? community.memberCount ?? 0,
    createdAt: community.created_at ?? community.createdAt ?? null,
  };
}

export function normalizeCommunityMember(member) {
  if (!member) {
    return null;
  }

  return {
    ...member,
    userId: member.user_id ?? member.userId ?? null,
    joinedAt: member.joined_at ?? member.joinedAt ?? null,
  };
}

export function normalizeCommunityPost(post) {
  if (!post) {
    return null;
  }

  return {
    ...post,
    authorId: post.owner_id ?? post.authorId ?? null,
    authorName: post.owner_username ?? post.authorName ?? 'Unknown',
    communityId: post.community_id ?? post.communityId ?? null,
    createdAt: post.created_at ?? post.createdAt ?? null,
  };
}

export function normalizeMessage(message) {
  if (!message) {
    return null;
  }

  return {
    ...message,
    senderId: message.sender_id ?? message.senderId ?? null,
    recipientId: message.recipient_id ?? message.recipientId ?? null,
    isRead: message.is_read ?? message.isRead ?? false,
    createdAt: message.created_at ?? message.createdAt ?? null,
  };
}

export function normalizeReport(report) {
  if (!report) {
    return null;
  }

  return {
    ...report,
    reporterId: report.reporter_id ?? report.reporterId ?? null,
    postId: report.post_id ?? report.postId ?? null,
    commentId: report.comment_id ?? report.commentId ?? null,
    createdAt: report.created_at ?? report.createdAt ?? null,
    statusLabel: String(report.status ?? '').toLowerCase(),
  };
}

export function normalizeAdminReport(report) {
  if (!report) {
    return null;
  }

  return {
    ...report,
    reporter: normalizeUser(report.reporter),
    targetId: report.target_id ?? report.targetId ?? null,
    targetType: report.target_type ?? report.targetType ?? 'post',
    targetTitle: report.target_title ?? report.targetTitle ?? null,
    targetPreview: report.target_preview ?? report.targetPreview ?? null,
    createdAt: report.created_at ?? report.createdAt ?? null,
  };
}

export function normalizeAdminDashboard(payload) {
  if (!payload) {
    return null;
  }

  return {
    stats: payload.stats ?? {},
    recentReports: Array.isArray(payload.recent_reports)
      ? payload.recent_reports.map(normalizeAdminReport).filter(Boolean)
      : Array.isArray(payload.recentReports)
        ? payload.recentReports.map(normalizeAdminReport).filter(Boolean)
        : [],
  };
}

export function buildUsersById(users = []) {
  return users.reduce((accumulator, user) => {
    if (user?.id != null) {
      accumulator[user.id] = user;
    }
    return accumulator;
  }, {});
}

export function groupConversations(messages = [], currentUserId, usersById = {}) {
  const conversations = new Map();

  messages
    .map(normalizeMessage)
    .filter(Boolean)
    .forEach((message) => {
      const participantId = message.senderId === currentUserId ? message.recipientId : message.senderId;
      if (participantId == null) {
        return;
      }

      const existing = conversations.get(participantId) ?? {
        id: participantId,
        participantId,
        participantName: usersById[participantId]?.username ?? `User #${participantId}`,
        lastMessage: '',
        lastMessageAt: null,
        unreadCount: 0,
        messages: [],
      };

      existing.messages.push(message);
      if (!existing.lastMessageAt || new Date(message.createdAt) > new Date(existing.lastMessageAt)) {
        existing.lastMessage = message.content;
        existing.lastMessageAt = message.createdAt;
      }
      if (message.recipientId === currentUserId && !message.isRead) {
        existing.unreadCount += 1;
      }

      conversations.set(participantId, existing);
    });

  return Array.from(conversations.values())
    .map((conversation) => ({
      ...conversation,
      messages: conversation.messages.sort(
        (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      ),
    }))
    .sort((left, right) => new Date(right.lastMessageAt ?? 0).getTime() - new Date(left.lastMessageAt ?? 0).getTime());
}