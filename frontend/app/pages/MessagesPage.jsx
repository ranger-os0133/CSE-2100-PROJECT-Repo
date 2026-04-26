import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowRight, MessageSquareMore, Plus, Search, SendHorizontal, UserRound } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import {
  buildUsersById,
  groupConversations,
  messagesService,
  normalizeMessage,
  usersService,
  wsService,
} from '../services';

export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { conversations, setConversations, currentUser } = useApp();
  const { showError, showSuccess } = useToast();
  const [allUsers, setAllUsers] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [activeUserId, setActiveUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [composeSearch, setComposeSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const requestedUserId = searchParams.get('user');

  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const usersResponse = await usersService.getAllUsers();
        const map = buildUsersById(usersResponse);
        const [inbox, sent] = await Promise.all([
          messagesService.getInbox(),
          messagesService.getSent(),
        ]);
        const conversationList = groupConversations([...inbox, ...sent], currentUser?.id, map);

        setAllUsers(usersResponse);
        setUsersById(map);
        setConversations(conversationList);
        setActiveUserId((previousUserId) => {
          if (requestedUserId) {
            return Number(requestedUserId);
          }

          if (previousUserId) {
            return previousUserId;
          }

          return conversationList[0]?.participantId || null;
        });
      } catch (error) {
        showError(error.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadConversations();
    }
  }, [currentUser, requestedUserId, setConversations, showError]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!activeUserId) {
        setMessages([]);
        return;
      }

      try {
        const conversationMessages = await messagesService.getConversation(activeUserId);
        setMessages(conversationMessages);

        const unreadIncoming = conversationMessages.filter(message => message.recipientId === currentUser?.id && !message.isRead);
        if (unreadIncoming.length > 0) {
          await Promise.all(unreadIncoming.map(message => messagesService.markAsRead(message.id).catch(() => null)));
          setMessages(prev => prev.map(message => (
            unreadIncoming.some(item => item.id === message.id) ? { ...message, isRead: true } : message
          )));
        }
      } catch (error) {
        showError(error.message || 'Failed to load conversation');
      }
    };

    if (currentUser) {
      loadConversation();
    }
  }, [activeUserId, currentUser, showError]);

  useEffect(() => {
    if (!activeUserId) {
      wsService.disconnect();
      return undefined;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return undefined;
    }

    const handleMessage = (rawMessage) => {
      const message = normalizeMessage(rawMessage);
      if (!message) {
        return;
      }

      if (message.senderId !== Number(activeUserId) && message.recipientId !== Number(activeUserId)) {
        return;
      }

      setMessages(prev => prev.some(item => item.id === message.id) ? prev : [...prev, message]);
      setConversations(prev => {
        const merged = groupConversations(
          [...prev.flatMap(conversation => conversation.messages || []), message],
          currentUser?.id,
          usersById,
        );
        return merged;
      });
    };

    wsService.on('message', handleMessage);
    wsService.connect(token, activeUserId).catch(() => null);

    return () => {
      wsService.off('message', handleMessage);
      wsService.disconnect();
    };
  }, [activeUserId, currentUser?.id, setConversations, usersById]);

  const refreshConversations = async () => {
    const [inbox, sent] = await Promise.all([
      messagesService.getInbox(),
      messagesService.getSent(),
    ]);
    setConversations(groupConversations([...inbox, ...sent], currentUser?.id, usersById));
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeUserId) return;

    try {
      if (wsService.isConnected()) {
        wsService.sendMessage({ content: messageText });
      } else {
        const sentMessage = await messagesService.sendMessage(activeUserId, messageText);
        setMessages(prev => [...prev, sentMessage]);
      }

      setMessageText('');
      await refreshConversations();
    } catch (error) {
      showError(error.message || 'Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messagesService.deleteMessage(messageId);
      setMessages(prev => prev.filter(message => message.id !== messageId));
      await refreshConversations();
      showSuccess('Message deleted');
    } catch (error) {
      showError(error.message || 'Failed to delete message');
    }
  };

  if (!currentUser) {
    return <div style={{ padding: '24px', color: '#F1F5F9' }}>Please log in to view messages</div>;
  }

  const activeUser = usersById[Number(activeUserId)] || null;
  const activeConversation = conversations.find(conversation => conversation.participantId === Number(activeUserId));
  const filteredUsers = allUsers.filter((user) => (
    user.username.toLowerCase().includes(composeSearch.trim().toLowerCase())
  ));

  const handleStartConversation = (userId) => {
    setActiveUserId(userId);
    setShowUserPicker(false);
    setSelectedUserId(null);
    setComposeSearch('');
  };

  return (
    <div className="page-shell">
      <section className="panel page-hero messages-hero">
        <span className="dashboard-badge">
          <MessageSquareMore size={14} />
          Direct messages
        </span>
        <h1>Private conversations with a cleaner rhythm.</h1>
        <p>Start a legendary conversation with your pals.</p>
      </section>

      <div className="messages-shell">
        <aside className="panel messages-sidebar">
          <div className="messages-sidebar__header">
            <div>
              <h2>Conversations</h2>
              <p>{conversations.length} active threads</p>
            </div>
            <button className="app-button app-button--primary" type="button" onClick={() => setShowUserPicker(previous => !previous)}>
              <Plus size={16} />
              New
            </button>
          </div>

          {showUserPicker && (
            <div className="messages-picker">
              <label className="messages-search">
                <Search size={16} />
                <input
                  type="text"
                  value={composeSearch}
                  onChange={event => setComposeSearch(event.target.value)}
                  placeholder="Search users"
                />
              </label>
              <div className="messages-picker__list">
                {filteredUsers.length === 0 ? (
                  <div className="panel-empty">No users match your search.</div>
                ) : (
                  filteredUsers.map(user => (
                    <article key={user.id} className="messages-picker__card">
                      <button
                        className="messages-picker__toggle"
                        type="button"
                        onClick={() => setSelectedUserId(previous => previous === user.id ? null : user.id)}
                      >
                        <div>
                          <strong>{user.username}</strong>
                          <span>{user.email}</span>
                        </div>
                        <ArrowRight size={16} />
                      </button>
                      {selectedUserId === user.id && (
                        <div className="messages-picker__actions">
                          <button className="app-button app-button--ghost" type="button" onClick={() => navigate(`/app/u/${encodeURIComponent(user.username)}`)}>
                            Profile
                          </button>
                          <button className="app-button app-button--success" type="button" onClick={() => handleStartConversation(user.id)}>
                            Message
                          </button>
                        </div>
                      )}
                    </article>
                  ))
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="panel-empty">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="panel-empty">No conversations yet. Start one with New.</div>
          ) : (
            <div className="messages-list">
              {conversations.map(conversation => {
                const participant = usersById[conversation.participantId];
                const isActive = Number(activeUserId) === conversation.participantId;
                return (
                  <button
                    key={conversation.participantId}
                    type="button"
                    className={`conversation-card ${isActive ? 'is-active' : ''}`}
                    onClick={() => setActiveUserId(conversation.participantId)}
                  >
                    <div className="conversation-card__avatar">
                      {(participant?.username ?? conversation.participantName).charAt(0).toUpperCase()}
                    </div>
                    <div className="conversation-card__body">
                      <strong>{participant?.username ?? conversation.participantName}</strong>
                      <p>{conversation?.lastMessage || 'No messages yet'}</p>
                    </div>
                    {conversation?.unreadCount > 0 && (
                      <span className="conversation-card__badge">{conversation.unreadCount}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="panel messages-thread">
          {activeUser ? (
            <>
              <div className="messages-thread__header">
                <div className="messages-thread__identity">
                  <div className="messages-thread__avatar">{activeUser.username.charAt(0).toUpperCase()}</div>
                  <div>
                    <h2>{activeUser.username}</h2>
                    <p>{activeConversation?.messages?.length || messages.length} messages in this thread</p>
                  </div>
                </div>
                <button className="app-button app-button--ghost" type="button" onClick={() => navigate(`/app/u/${encodeURIComponent(activeUser.username)}`)}>
                  <UserRound size={16} />
                  View Profile
                </button>
              </div>

              <div className="messages-thread__scroll">
                {messages.length === 0 ? (
                  <div className="panel-empty">
                    {activeConversation ? 'No messages in this conversation yet.' : `Start the conversation with ${activeUser.username}.`}
                  </div>
                ) : (
                  messages.map(message => {
                    const isMine = message.senderId === currentUser.id;
                    return (
                      <article key={message.id} className={`message-bubble ${isMine ? 'is-mine' : 'is-theirs'}`}>
                        <div className="message-bubble__content">{message.content}</div>
                        <div className="message-bubble__meta">
                          <span>{new Date(message.createdAt).toLocaleString()}</span>
                          <button type="button" onClick={() => handleDeleteMessage(message.id)}>Delete</button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              <div className="messages-thread__composer">
                <label className="messages-thread__input">
                  <input
                    type="text"
                    value={messageText}
                    onChange={event => setMessageText(event.target.value)}
                    onKeyDown={event => event.key === 'Enter' && handleSendMessage()}
                    placeholder={`Message ${activeUser.username}`}
                  />
                </label>
                <button className="app-button app-button--primary" type="button" onClick={handleSendMessage}>
                  <SendHorizontal size={16} />
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="panel-empty messages-thread__empty">Select a conversation or start a new one.</div>
          )}
        </section>
      </div>
    </div>
  );
}
