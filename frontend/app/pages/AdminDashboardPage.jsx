import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCheck, MessageSquareText, ShieldBan, Trash2, UserRoundX, Users } from 'lucide-react';
import { adminService } from '../services';
import { useToast } from '../store/ToastContext';

const REPORT_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Resolved', value: 'resolved' },
];

export default function AdminDashboardPage() {
  const { showError, showSuccess } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportFilter, setReportFilter] = useState('pending');
  const [reportSearch, setReportSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const loadDashboard = async () => {
    const response = await adminService.getDashboard();
    setDashboard(response);
  };

  const loadReports = async () => {
    const response = await adminService.getReports({ status: reportFilter, search: reportSearch });
    setReports(response);
  };

  const loadUsers = async () => {
    const response = await adminService.getUsers(userSearch);
    setUsers(response);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await Promise.all([loadDashboard(), loadReports(), loadUsers()]);
      } catch (error) {
        showError(error.message || 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [showError]);

  useEffect(() => {
    const load = async () => {
      try {
        await loadReports();
      } catch (error) {
        showError(error.message || 'Failed to load reports');
      }
    };

    load();
  }, [reportFilter, reportSearch, showError]);

  useEffect(() => {
    const load = async () => {
      try {
        await loadUsers();
      } catch (error) {
        showError(error.message || 'Failed to load users');
      }
    };

    load();
  }, [userSearch, showError]);

  const handleReview = async (reportId, status) => {
    try {
      const updated = await adminService.reviewReport(reportId, status);
      setReports(prev => prev.map(report => report.id === reportId ? updated : report));
      await loadDashboard();
      showSuccess('Report updated');
    } catch (error) {
      showError(error.message || 'Failed to update report');
    }
  };

  const handleDeleteTarget = async (report) => {
    if (!report.targetId) {
      return;
    }

    try {
      if (report.targetType === 'post') {
        await adminService.deletePost(report.targetId);
      } else {
        await adminService.deleteComment(report.targetId);
      }

      setReports(prev => prev.filter(item => item.id !== report.id));
      await loadDashboard();
      showSuccess(`${report.targetType === 'post' ? 'Post' : 'Comment'} removed`);
    } catch (error) {
      showError(error.message || 'Failed to remove content');
    }
  };

  const handleToggleUser = async (userId, isActive) => {
    try {
      const updated = await adminService.updateUserStatus(userId, !isActive);
      setUsers(prev => prev.map(user => user.id === userId ? updated : user));
      await loadDashboard();
      showSuccess(updated.isActive ? 'User reactivated' : 'User deactivated');
    } catch (error) {
      showError(error.message || 'Failed to update user');
    }
  };

  const stats = dashboard?.stats ?? {};
  const recentReports = dashboard?.recentReports ?? [];

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero panel">
        <div>
          <span className="dashboard-badge dashboard-badge--danger">
            <AlertTriangle size={14} />
            Admin overview
          </span>
          <h1>Moderation and platform control in one surface.</h1>
          <p>
            Keep the queue moving, freeze abusive accounts, and remove flagged content without leaving the dashboard.
          </p>
        </div>
      </section>

      <section className="stats-grid">
        {[
          { label: 'Pending reports', value: stats.pending_reports ?? 0, icon: AlertTriangle },
          { label: 'Resolved reports', value: stats.resolved_reports ?? 0, icon: CheckCheck },
          { label: 'Total users', value: stats.total_users ?? 0, icon: Users },
          { label: 'Admin accounts', value: stats.admin_users ?? 0, icon: ShieldBan },
        ].map(({ label, value, icon: Icon }) => (
          <article key={label} className="stat-card panel">
            <span className="stat-card__icon"><Icon size={18} /></span>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="panel dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Recent queue pulse</h2>
              <p>Latest reports entering moderation.</p>
            </div>
          </div>

          {loading ? (
            <div className="panel-empty">Loading dashboard data...</div>
          ) : recentReports.length === 0 ? (
            <div className="panel-empty">No recent reports. The queue is clear.</div>
          ) : (
            <div className="mini-report-list">
              {recentReports.map(report => (
                <article key={report.id} className="mini-report-card">
                  <div>
                    <strong>{report.reason}</strong>
                    <p>{report.reporter?.username} reported a {report.targetType}.</p>
                  </div>
                  <span className={`status-pill status-pill--${report.status}`}>{report.status}</span>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="panel dashboard-panel">
          <div className="panel-header">
            <div>
              <h2>Platform counts</h2>
              <p>Useful quick totals while you moderate.</p>
            </div>
          </div>

          <div className="metric-list">
            <div><span>Active users</span><strong>{stats.active_users ?? 0}</strong></div>
            <div><span>Total posts</span><strong>{stats.total_posts ?? 0}</strong></div>
            <div><span>Total comments</span><strong>{stats.total_comments ?? 0}</strong></div>
            <div><span>Total reports</span><strong>{stats.total_reports ?? 0}</strong></div>
          </div>
        </div>
      </section>

      <section className="panel dashboard-panel">
        <div className="panel-header panel-header--stacked">
          <div>
            <h2>Report moderation</h2>
            <p>Search across reasons, reporters, and target previews.</p>
          </div>

          <div className="panel-controls">
            <div className="filter-row">
              {REPORT_FILTERS.map(filter => (
                <button
                  key={filter.label}
                  type="button"
                  className={`chip-button ${reportFilter === filter.value ? 'is-active' : ''}`}
                  onClick={() => setReportFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <input
              className="search-input"
              type="search"
              placeholder="Search reports"
              value={reportSearch}
              onChange={event => setReportSearch(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="panel-empty">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="panel-empty">No reports match the current filter.</div>
        ) : (
          <div className="report-list">
            {reports.map(report => (
              <article key={report.id} className="report-card">
                <div className="report-card__header">
                  <div>
                    <div className="report-card__eyebrow">{report.targetType} #{report.targetId ?? 'removed'}</div>
                    <h3>{report.reason}</h3>
                  </div>
                  <span className={`status-pill status-pill--${report.status}`}>{report.status}</span>
                </div>

                <div className="report-card__meta">
                  <span>Reporter: {report.reporter?.username}</span>
                  <span>{new Date(report.createdAt).toLocaleString()}</span>
                </div>

                {report.description && <p className="report-card__description">{report.description}</p>}

                <div className="report-card__preview">
                  <strong>{report.targetTitle || 'Content preview'}</strong>
                  <p>{report.targetPreview || 'Original content is no longer available.'}</p>
                </div>

                <div className="report-card__actions">
                  <button className="app-button app-button--ghost" type="button" onClick={() => handleReview(report.id, 'reviewed')}>
                    <MessageSquareText size={16} />
                    Mark reviewed
                  </button>
                  <button className="app-button app-button--success" type="button" onClick={() => handleReview(report.id, 'resolved')}>
                    <CheckCheck size={16} />
                    Resolve
                  </button>
                  <button className="app-button app-button--danger" type="button" onClick={() => handleDeleteTarget(report)}>
                    <Trash2 size={16} />
                    Remove {report.targetType}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel dashboard-panel">
        <div className="panel-header panel-header--stacked">
          <div>
            <h2>User access</h2>
            <p>Deactivate abusive accounts and reactivate legitimate ones.</p>
          </div>
          <input
            className="search-input"
            type="search"
            placeholder="Search users"
            value={userSearch}
            onChange={event => setUserSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="panel-empty">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="panel-empty">No users found.</div>
        ) : (
          <div className="user-table">
            {users.map(user => (
              <article key={user.id} className="user-row">
                <div>
                  <strong>{user.username}</strong>
                  <p>{user.email}</p>
                </div>

                <div className="user-row__meta">
                  <span className={`status-pill ${user.isActive ? 'status-pill--active' : 'status-pill--inactive'}`}>
                    {user.isActive ? 'active' : 'inactive'}
                  </span>
                  <span className="role-pill">{user.role}</span>
                  <button className="app-button app-button--ghost" type="button" onClick={() => handleToggleUser(user.id, user.isActive)}>
                    <UserRoundX size={16} />
                    {user.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}