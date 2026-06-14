import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { analyticsApi } from '../../api/analytics.api';
import { useFetch } from '../../hooks/useFetch';
import type { CandidateAnalytics, JobAnalytics } from '../../types';
import { CANDIDATE_STATUS_CONFIG, JOB_STATUS_CONFIG } from '../../utils/constants';

const CHART_COLORS = ['#6c5ce7', '#00d68f', '#ff6b6b', '#ffa726', '#4fc3f7', '#a29bfe', '#74b9ff', '#fd79a8', '#55efc4', '#fdcb6e'];

export default function AnalyticsPage() {
  const { data: candidateAnalytics, isLoading: cLoading } = useFetch<CandidateAnalytics>(
    () => analyticsApi.getCandidateAnalytics(),
    []
  );
  const { data: jobAnalytics, isLoading: jLoading } = useFetch<JobAnalytics>(
    () => analyticsApi.getJobAnalytics(),
    []
  );

  const isLoading = cLoading || jLoading;

  if (isLoading) {
    return (
      <div className="page-loader">
        <div className="loader-spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  const candidateByStatus = (candidateAnalytics?.byStatus || []).map((item) => ({
    name: CANDIDATE_STATUS_CONFIG[item._id as keyof typeof CANDIDATE_STATUS_CONFIG]?.label || item._id,
    value: item.count,
    color: CANDIDATE_STATUS_CONFIG[item._id as keyof typeof CANDIDATE_STATUS_CONFIG]?.color || '#8888a0',
  }));

  const candidateBySource = (candidateAnalytics?.bySource || []).map((item) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
  }));

  const topSkills = (candidateAnalytics?.topSkills || []).slice(0, 12).map((item) => ({
    name: item._id,
    count: item.count,
  }));

  const jobByStatus = (jobAnalytics?.byStatus || []).map((item) => ({
    name: JOB_STATUS_CONFIG[item._id as keyof typeof JOB_STATUS_CONFIG]?.label || item._id,
    value: item.count,
    color: JOB_STATUS_CONFIG[item._id as keyof typeof JOB_STATUS_CONFIG]?.color || '#8888a0',
  }));

  return (
    <div className="animate-fade-in">
      <div className="grid-2">
        {/* Candidate by Status — Pie */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Candidates by Status</h3>
          {candidateByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={candidateByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {candidateByStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-center" style={{ padding: '3rem 0' }}>No data yet</p>
          )}
          <div className="flex gap-1" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {candidateByStatus.map((item) => (
              <div key={item.name} className="flex items-center gap-1 text-sm">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </div>

        {/* Jobs by Status — Pie */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Jobs by Status</h3>
          {jobByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={jobByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {jobByStatus.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-center" style={{ padding: '3rem 0' }}>No data yet</p>
          )}
          <div className="flex gap-1" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {jobByStatus.map((item) => (
              <div key={item.name} className="flex items-center gap-1 text-sm">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, display: 'inline-block' }} />
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </div>

        {/* Top Skills — Bar */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Top Skills in Talent Pool</h3>
          {topSkills.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topSkills} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} width={75} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {topSkills.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-center" style={{ padding: '3rem 0' }}>No data yet</p>
          )}
        </div>

        {/* Candidate Sources — Bar */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Candidate Sources</h3>
          {candidateBySource.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={candidateBySource}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-center" style={{ padding: '3rem 0' }}>No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
