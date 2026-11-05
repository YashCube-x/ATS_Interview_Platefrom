import {
  Users,
  Briefcase,
  UserCheck,
  UserX,
  Calendar,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { analyticsApi } from '../../api/analytics.api';
import { candidatesApi } from '../../api/candidates.api';
import { useFetch } from '../../hooks/useFetch';
import type { DashboardMetrics, Candidate } from '../../types';
import { CANDIDATE_STATUS_CONFIG } from '../../utils/constants';
import { formatRelativeTime } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

const metricCards = [
  { key: 'totalCandidates',       label: 'Total Candidates',    icon: Users,        link: '/candidates' },
  { key: 'totalJobs',             label: 'Total Jobs',          icon: Briefcase,    link: '/jobs' },
  { key: 'openJobs',              label: 'Open Positions',      icon: TrendingUp,   link: '/jobs?status=open' },
  { key: 'shortlistedCandidates', label: 'Shortlisted',         icon: UserCheck,    link: '/candidates?status=shortlisted' },
  { key: 'selectedCandidates',    label: 'Selected',            icon: CheckCircle,  link: '/candidates?status=selected' },
  { key: 'rejectedCandidates',    label: 'Rejected',            icon: UserX,        link: '/candidates?status=rejected' },
  { key: 'upcomingInterviews',    label: 'Upcoming Interviews', icon: Calendar,     link: '/interviews' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: metrics, isLoading: metricsLoading } = useFetch<DashboardMetrics>(
    () => analyticsApi.getDashboard(),
    []
  );
  const { data: candidates, isLoading: candidatesLoading } = useFetch<Candidate[]>(
    () => candidatesApi.list(),
    []
  );

  const recentCandidates = candidates?.slice(0, 8) || [];

  return (
    <div className="animate-fade-in">
      {/* Metric Cards - 4px corners, 36px icon tile, tabular-nums */}
      <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
        {metricCards.map((card) => (
          <div
            key={card.key}
            className="metric-card"
            onClick={() => navigate(card.link)}
            style={{ cursor: 'pointer' }}
            title={`View ${card.label}`}
          >
            <div className="metric-icon">
              <card.icon size={20} />
            </div>
            <div>
              <div className="metric-value tnum">
                {metricsLoading ? '—' : (metrics as unknown as Record<string, number>)?.[card.key] ?? 0}
              </div>
              <div className="metric-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Row */}
      {!metricsLoading && metrics && (
        <div className="grid-2" style={{ marginTop: '2rem' }}>
          <div className="glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Candidate pipeline Funnel</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Total Pool', count: metrics.totalCandidates },
                  { name: 'Shortlisted', count: metrics.shortlistedCandidates },
                  { name: 'Selected', count: metrics.selectedCandidates },
                  { name: 'Rejected', count: metrics.rejectedCandidates },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DDE4F7" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7388', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6B7388', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid #DDE4F7',
                      borderRadius: '4px',
                      color: '#111111',
                    }}
                  />
                  <Bar dataKey="count" fill="#1A3181" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Jobs & Positions status</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active Positions', value: metrics.openJobs },
                      { name: 'Draft/Closed', value: Math.max(0, metrics.totalJobs - metrics.openJobs) },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#1A3181" />
                    <Cell fill="#B9C6EA" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#FFFFFF',
                      border: '1px solid #DDE4F7',
                      borderRadius: '4px',
                      color: '#111111',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Candidates Table */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <div className="flex items-center justify-between mb-2">
          <h3>Recent Candidates</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/candidates')}>
            View All
          </button>
        </div>

        {candidatesLoading ? (
          <div className="page-loader">
            <div className="loader-spinner" />
          </div>
        ) : recentCandidates.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <Users size={40} />
            <p>No candidates yet</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Experience</th>
                  <th>Added</th>
                </tr>
              </thead>
              <tbody>
                {recentCandidates.map((c) => {
                  const statusConfig = CANDIDATE_STATUS_CONFIG[c.status];
                  return (
                    <tr key={c._id} onClick={() => navigate(`/candidates/${c._id}`)}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</td>
                      <td>{c.email}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: `${statusConfig.color}18`,
                            color: statusConfig.color,
                          }}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td>{c.experience?.totalYears ?? 0} yrs</td>
                      <td>{formatRelativeTime(c.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
