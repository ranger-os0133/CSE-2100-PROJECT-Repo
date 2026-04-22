import React, { useEffect, useState } from 'react';
import { CheckCircle2, Shield } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useToast } from '../store/ToastContext';
import { reportsService } from '../services';

export default function ReportsPage() {
  const { currentUser } = useApp();
  const { showError, showSuccess } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const response = await reportsService.getMyReports();
        setReports(response);
      } catch (error) {
        showError(error.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) loadReports();
  }, [currentUser, showError]);

  if (!currentUser) {
    return <div className="page-shell"><div className="panel panel-empty">Please log in to view your reports.</div></div>;
  }

  return (
    <div className="page-shell">
      <section className="panel page-hero">
        <span className="dashboard-badge">
          <Shield size={14} />
          Personal report history
        </span>
        <h1>Your submitted reports</h1>
        <p>Track which items you flagged and see whether moderation has reviewed them.</p>
      </section>

      {loading ? (
        <div className="panel panel-empty">Loading your reports...</div>
      ) : reports.length === 0 ? (
        <div className="panel panel-empty">
          <CheckCircle2 size={40} color="#22C55E" style={{ margin: '0 auto', marginBottom: '16px' }} />
          <p>No reports submitted yet.</p>
          <span>When you flag a post or comment, it will show up here.</span>
        </div>
      ) : (
        <div className="report-list">
          {reports.map(report => (
            <article key={report.id} className="report-card">
              <div className="report-card__header">
                <div>
                  <div className="report-card__eyebrow">{report.postId ? `Post #${report.postId}` : `Comment #${report.commentId}`}</div>
                  <h3>{report.reason}</h3>
                </div>
                <span className={`status-pill status-pill--${report.status}`}>{String(report.status).toLowerCase()}</span>
              </div>
              {report.description && <p className="report-card__description">{report.description}</p>}
              <div className="report-card__meta">
                <span>Reporter ID: {report.reporterId}</span>
                <span>{new Date(report.createdAt).toLocaleString()}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
