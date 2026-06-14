import { useState } from 'react';
import { Globe, FileText, ExternalLink, ChevronDown, Check, X, Eye, Search } from 'lucide-react';
import { webApplicationsApi, type WebApplication, type WebAppStatus } from '../../api/webApplications.api';
import { useFetch } from '../../hooks/useFetch';
import { formatRelativeTime, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<WebAppStatus, { label: string; color: string; bg: string }> = {
  new:       { label: 'New',       color: '#4fc3f7', bg: 'rgba(79,195,247,0.12)' },
  reviewed:  { label: 'Reviewed',  color: '#ffa726', bg: 'rgba(255,167,38,0.12)' },
  converted: { label: 'Converted', color: '#0d5236', bg: 'rgba(13,82,54,0.12)' },
  rejected:  { label: 'Rejected',  color: '#d32f2f', bg: 'rgba(211,47,47,0.12)' },
};

const STATUS_TABS: (WebAppStatus | 'all')[] = ['all', 'new', 'reviewed', 'converted', 'rejected'];

export default function WebApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<WebAppStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<WebApplication | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useFetch(
    () =>
      webApplicationsApi
        .list({ status: statusFilter === 'all' ? undefined : statusFilter, limit: 100 })
        .then((r) => r.data.data),
    [statusFilter]
  );

  const applications = (data?.applications ?? []).filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.positionApplied.toLowerCase().includes(q)
    );
  });

  const handleStatusChange = async (id: string, newStatus: WebAppStatus) => {
    setUpdatingId(id);
    try {
      await webApplicationsApi.updateStatus(id, newStatus);
      toast.success(`Marked as ${STATUS_CONFIG[newStatus].label}`);
      refetch();
      if (selected?._id === id) {
        setSelected((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center gap-2">
          <Globe size={20} style={{ color: 'var(--accent)' }} />
          <div>
            <h2 style={{ margin: 0 }}>Website Applications</h2>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Applications submitted from ashtatech.com — {data?.total ?? 0} total
            </p>
          </div>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {(['new', 'reviewed', 'converted', 'rejected'] as WebAppStatus[]).map((s) => (
          <button
            key={s}
            className="badge"
            onClick={() => setStatusFilter(s === statusFilter ? 'all' : s)}
            style={{
              background: STATUS_CONFIG[s].bg,
              color: STATUS_CONFIG[s].color,
              cursor: 'pointer',
              border: statusFilter === s ? `1.5px solid ${STATUS_CONFIG[s].color}` : '1.5px solid transparent',
              padding: '0.375rem 0.875rem',
              fontSize: '0.8125rem',
              transition: 'all 150ms ease',
            }}
          >
            {STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper" style={{ maxWidth: 340 }}>
          <Search />
          <input
            type="text"
            className="input"
            placeholder="Search by name, email, position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="webapp-search"
          />
        </div>
        <div className="tabs" style={{ display: 'inline-flex' }}>
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              className={`tab${statusFilter === s ? ' active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      {isLoading ? (
        <div className="page-loader">
          <div className="loader-spinner" />
          <p>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <Globe size={48} />
          <h3>No applications found</h3>
          <p className="text-muted">
            {statusFilter === 'all'
              ? 'No website applications yet. Share the API endpoint with the main website developer.'
              : `No ${STATUS_CONFIG[statusFilter as WebAppStatus]?.label} applications.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1.25rem', alignItems: 'start' }}>
          {/* Table */}
          <div className="table-container">
            <table className="table" id="web-applications-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Position</th>
                  <th>Resume</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => {
                  const sc = STATUS_CONFIG[app.status];
                  return (
                    <tr
                      key={app._id}
                      onClick={() => setSelected(app._id === selected?._id ? null : app)}
                      style={{ background: selected?._id === app._id ? 'var(--accent-glow)' : undefined }}
                    >
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{app.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.email}</div>
                        {app.phone && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{app.phone}</div>
                        )}
                      </td>
                      <td style={{ fontWeight: 500 }}>{app.positionApplied}</td>
                      <td>
                        {app.resumeUrl ? (
                          <a
                            href={app.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => e.stopPropagation()}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-light)' }}
                          >
                            <FileText size={14} /> View
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        {formatRelativeTime(app.createdAt)}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          {app.status !== 'reviewed' && (
                            <button
                              className="btn btn-ghost btn-sm"
                              disabled={updatingId === app._id}
                              onClick={() => handleStatusChange(app._id, 'reviewed')}
                              title="Mark as Reviewed"
                              style={{ padding: '0.25rem 0.5rem' }}
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          {app.status !== 'converted' && (
                            <button
                              className="btn btn-ghost btn-sm"
                              disabled={updatingId === app._id}
                              onClick={() => handleStatusChange(app._id, 'converted')}
                              title="Mark as Converted"
                              style={{ padding: '0.25rem 0.5rem', color: 'var(--success)' }}
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button
                              className="btn btn-ghost btn-sm"
                              disabled={updatingId === app._id}
                              onClick={() => handleStatusChange(app._id, 'rejected')}
                              title="Reject"
                              style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="glass-card animate-slide-up" style={{ padding: '1.5rem', position: 'sticky', top: '1rem' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Application Detail</h3>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => setSelected(null)}
                  style={{ padding: '4px' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {/* Status */}
                <div>
                  <label style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                    Status
                  </label>
                  <div style={{ marginTop: '0.25rem' }}>
                    <span className="badge" style={{ background: STATUS_CONFIG[selected.status].bg, color: STATUS_CONFIG[selected.status].color }}>
                      {STATUS_CONFIG[selected.status].label}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <DetailRow label="Full Name" value={selected.fullName} />
                <DetailRow label="Email" value={selected.email} />
                {selected.phone && <DetailRow label="Phone" value={selected.phone} />}
                <DetailRow label="Position Applied" value={selected.positionApplied} highlight />
                <DetailRow label="Applied On" value={formatDate(selected.createdAt)} />
                {selected.referrerUrl && (
                  <DetailRow label="Referrer URL" value={selected.referrerUrl} />
                )}

                {/* Cover Letter */}
                {selected.coverLetter && (
                  <div>
                    <label style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                      Cover Letter
                    </label>
                    <p style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--bg-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-md)', whiteSpace: 'pre-wrap' }}>
                      {selected.coverLetter}
                    </p>
                  </div>
                )}

                {/* Resume */}
                {selected.resumeUrl && (
                  <div>
                    <label style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
                      Resume
                    </label>
                    <a
                      href={selected.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: '0.375rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                    >
                      <FileText size={14} /> {selected.resumeOriginalName || 'Download Resume'}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                {/* Quick-action buttons */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(['reviewed', 'converted', 'rejected'] as WebAppStatus[]).map((s) => (
                    <button
                      key={s}
                      className="btn btn-sm"
                      disabled={selected.status === s || updatingId === selected._id}
                      onClick={() => handleStatusChange(selected._id, s)}
                      style={{
                        background: STATUS_CONFIG[s].bg,
                        color: STATUS_CONFIG[s].color,
                        border: `1px solid ${STATUS_CONFIG[s].color}40`,
                      }}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <label style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
        {label}
      </label>
      <p style={{ marginTop: '0.125rem', fontSize: '0.875rem', color: highlight ? 'var(--accent-light)' : 'var(--text-primary)', fontWeight: highlight ? 600 : 400 }}>
        {value}
      </p>
    </div>
  );
}
