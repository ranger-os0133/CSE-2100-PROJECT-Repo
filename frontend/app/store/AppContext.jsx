import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService, setUnauthorizedCallback } from '../services';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [authReady, setAuthReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [reports, setReports] = useState([]);

  // Load auth from localStorage on mount and setup unauthorized callback
  useEffect(() => {
    let isMounted = true;

    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && refreshToken && user) {
      try {
        setCurrentUser(JSON.parse(user));
        setIsAuthenticated(true);
        setAuthReady(true);

        authService.getCurrentUser()
          .then((freshUser) => {
            if (!isMounted || !freshUser) {
              return;
            }

            setCurrentUser(freshUser);
            localStorage.setItem('currentUser', JSON.stringify(freshUser));
          })
          .catch(() => {
            if (!isMounted) {
              return;
            }

            setIsAuthenticated(false);
            setCurrentUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('currentUser');
            setAuthReady(true);
          });
      } catch (error) {
        console.error('Failed to load auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
        setAuthReady(true);
      }
    } else {
      setAuthReady(true);
    }

    // Setup callback for when API returns 401 (unauthorized)
    setUnauthorizedCallback(() => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      setAuthReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Post operations
  const createPost = useCallback((title, content, isAnonymous = false) => {
    // Will be replaced with API call
    const newPost = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content,
      anonymous: isAnonymous,
      authorId: currentUser?.id,
      authorName: currentUser?.username,
      votes: 0,
      comments: [],
      files: [],
      createdAt: new Date().toISOString(),
    };
    setPosts(prev => [newPost, ...prev]);
    return newPost;
  }, [currentUser]);

  const updatePost = useCallback((id, title, content) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, title, content } : p));
  }, []);

  const deletePost = useCallback((id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  const votePost = useCallback((id, voteType) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const prevVote = p.userVote || 0;
      const newVote = prevVote === voteType ? 0 : voteType;
      const diff = newVote - prevVote;
      return { ...p, votes: p.votes + diff, userVote: newVote };
    }));
  }, []);

  // Comment operations
  const addComment = useCallback((postId, content) => {
    const comment = {
      id: Math.random().toString(36).substr(2, 9),
      postId,
      content,
      authorId: currentUser?.id,
      authorName: currentUser?.username,
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
    return comment;
  }, [currentUser]);

  const deleteComment = useCallback((postId, commentId) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments.filter(c => c.id !== commentId) } : p));
  }, []);

  // Community operations
  const createCommunity = useCallback((name, description) => {
    const newCommunity = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      captainId: currentUser?.id,
      captainName: currentUser?.username,
      memberCount: 1,
      members: [{ id: currentUser?.id, username: currentUser?.username, role: 'captain' }],
      joined: true,
      createdAt: new Date().toISOString(),
    };
    setCommunities(prev => [newCommunity, ...prev]);
    return newCommunity;
  }, [currentUser]);

  const joinCommunity = useCallback((id) => {
    setCommunities(prev => prev.map(c => c.id === id ? {
      ...c,
      joined: true,
      memberCount: c.memberCount + 1,
      members: [...c.members, { id: currentUser?.id, username: currentUser?.username, role: 'member' }],
    } : c));
  }, [currentUser]);

  const leaveCommunity = useCallback((id) => {
    setCommunities(prev => prev.map(c => c.id === id ? {
      ...c,
      joined: false,
      memberCount: c.memberCount - 1,
      members: c.members.filter(m => m.id !== currentUser?.id),
    } : c));
  }, [currentUser]);

  // Message operations
  const sendMessage = useCallback((conversationId, content) => {
    const message = {
      id: Math.random().toString(36).substr(2, 9),
      conversationId,
      senderId: currentUser?.id,
      content,
      createdAt: new Date().toISOString(),
    };
    setConversations(prev => prev.map(conv => conv.id === conversationId ? {
      ...conv,
      messages: [...conv.messages, message],
      lastMessage: content,
      lastMessageAt: message.createdAt,
    } : conv));
  }, [currentUser]);

  // Report operations
  const reportContent = useCallback((reportType, contentId, reason) => {
    const newReport = {
      id: Math.random().toString(36).substr(2, 9),
      report_type: reportType,
      content_id: contentId,
      reason,
      reporterId: currentUser?.id,
      createdAt: new Date().toISOString(),
    };
    setReports(prev => [newReport, ...prev]);
  }, [currentUser]);

  const value = {
    authReady,
    currentUser,
    setCurrentUser,
    isAuthenticated,
    setIsAuthenticated,
    posts,
    setPosts,
    communities,
    setCommunities,
    conversations,
    setConversations,
    reports,
    setReports,
    createPost,
    updatePost,
    deletePost,
    votePost,
    addComment,
    deleteComment,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    sendMessage,
    reportContent,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
