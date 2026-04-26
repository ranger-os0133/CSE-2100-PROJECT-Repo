import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Compass, Plus, Users } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { communitiesService, usersService } from '../services';

export default function CommunitiesPage() {
  const navigate = useNavigate();
  const { communities, setCommunities, currentUser } = useApp();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [membershipState, setMembershipState] = useState({});
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    const loadCommunities = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const response = await communitiesService.getAllCommunities();
        const captainIds = Array.from(new Set(response.map(community => community.captainId).filter(Boolean)));

        const captainEntries = await Promise.all(
          captainIds.map(async (captainId) => {
            if (captainId === currentUser.id) {
              return [captainId, currentUser];
            }

            try {
              const captain = await usersService.getUser(captainId);
              return [captainId, captain];
            } catch {
              return [captainId, null];
            }
          }),
        );

        const membershipEntries = await Promise.all(
          response.map(async (community) => {
            try {
              const members = await communitiesService.listMembers(community.id);
              return [community.id, members.some(member => member.userId === currentUser.id) ? 'joined' : 'left'];
            } catch {
              return [community.id, 'left'];
            }
          }),
        );

        const captainMap = Object.fromEntries(captainEntries);
        const membershipMap = Object.fromEntries(membershipEntries);

        setMembershipState(membershipMap);
        setCommunities(response.map(community => ({
          ...community,
          captainName: captainMap[community.captainId]?.username || `User #${community.captainId}`,
        })));
      } catch (error) {
        showError('Failed to load communities');
      } finally {
        setLoading(false);
      }
    };
    loadCommunities();
  }, [currentUser, setCommunities, showError]);

  const handleJoinCommunity = async (communityId) => {
    try {
      await communitiesService.joinCommunity(communityId);
      setMembershipState(prev => ({ ...prev, [communityId]: 'joined' }));
      setCommunities(prev => prev.map(c => (
        c.id === communityId ? { ...c, memberCount: (c.memberCount || 0) + 1 } : c
      )));
      showSuccess('Joined community!');
    } catch (error) {
      showError(error.message || 'Failed to join community');
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    try {
      await communitiesService.leaveCommunity(communityId);
      setMembershipState(prev => ({ ...prev, [communityId]: 'left' }));
      setCommunities(prev => prev.map(c => (
        c.id === communityId ? { ...c, memberCount: Math.max((c.memberCount || 1) - 1, 0) } : c
      )));
      showSuccess('Left community');
    } catch (error) {
      showError(error.message || 'Failed to leave community');
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showError('Community name is required');
      return;
    }

    setCreating(true);
    try {
      const community = await communitiesService.createCommunity(form.name, form.description);
      setCommunities(prev => [{
        ...community,
        captainName: currentUser.username,
      }, ...prev]);
      setMembershipState(prev => ({ ...prev, [community.id]: 'joined' }));
      setForm({ name: '', description: '' });
      showSuccess('Community created!', 'You are now the captain.');
    } catch (error) {
      showError(error.message || 'Failed to create community');
    } finally {
      setCreating(false);
    }
  };

  if (!currentUser) {
    return <div className="page-shell"><div className="panel panel-empty">Please log in to join communities.</div></div>;
  }

  return (
    <div className="page-shell">
      <section className="panel page-hero">
        <span className="dashboard-badge">
          <Compass size={14} />
          Community network
        </span>
        <h1>Find your circles or build a new one.</h1>
        <p>Clubs, cohorts, and interest spaces now live in a cleaner browse-and-create experience.</p>
      </section>

      <form onSubmit={handleCreateCommunity} className="panel communities-create-form">
        <input
          type="text"
          placeholder="Community name"
          value={form.name}
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          className="search-input"
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          className="search-input"
        />
        <button
          type="submit"
          disabled={creating}
          className="app-button app-button--primary"
        >
          <Plus size={16} />
          {creating ? 'Creating...' : 'Create'}
        </button>
      </form>

      {loading ? (
        <div className="panel panel-empty">Loading communities...</div>
      ) : communities.length === 0 ? (
        <div className="panel panel-empty">No communities yet.</div>
      ) : (
        <div className="community-grid">
          {communities.map(community => (
            <article key={community.id} className="community-card panel">
              <div className="community-card__icon"><Users size={20} /></div>
              <h2>{community.name}</h2>
              <p>{community.description}</p>
              <div className="community-card__meta">
                <span>{community.memberCount} members</span>
                <span>Captain: {community.captainName}</span>
              </div>
              <div className="community-card__actions">
                <button
                  onClick={() => navigate(`/app/communities/${community.id}`)}
                  className="app-button app-button--primary"
                >
                  Open
                </button>
                <button
                  onClick={() => handleJoinCommunity(community.id)}
                  className={`app-button ${membershipState[community.id] === 'joined' ? 'app-button--ghost' : 'app-button--success'}`}
                >
                  {membershipState[community.id] === 'joined' ? 'Joined' : 'Join'}
                </button>
                <button
                  onClick={() => handleLeaveCommunity(community.id)}
                  className="app-button app-button--ghost"
                >
                  Leave
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
