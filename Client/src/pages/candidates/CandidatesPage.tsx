import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Users, Filter } from 'lucide-react';
import { candidatesApi } from '../../api/candidates.api';
import { useFetch } from '../../hooks/useFetch';
import type { Candidate, CandidateStatus } from '../../types';
import { CANDIDATE_STATUS_CONFIG } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const statusFilters: (CandidateStatus | 'all')[] = [
  'all', 'applied', 'reviewed', 'shortlisted', 'selected', 'rejected',
];

const VALID_STATUSES = new Set(statusFilters);

export default function CandidatesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') as CandidateStatus | 'all';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>(
    VALID_STATUSES.has(initialStatus) ? initialStatus : 'all'
  );

  const { data: candidates, isLoading } = useFetch<Candidate[]>(
    () => candidatesApi.list(),
    []
  );

  const filtered = (candidates || []).filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in">
      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search />
          <input
            type="text"
            className="input"
            placeholder="Search by name, email, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="candidate-search"
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <div className="tabs">
            {statusFilters.map((s) => (
              <button
                key={s}
                className={`tab${statusFilter === s ? ' active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'All' : CANDIDATE_STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="page-loader">
          <div className="loader-spinner" />
          <p>Loading candidates...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>No candidates found</h3>
          <p className="text-muted">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table" id="candidates-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Location</th>
                <th>Experience</th>
                <th>Skills</th>
                <th>Status</th>
                <th>Source</th>
                <th>Applied</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const statusConfig = CANDIDATE_STATUS_CONFIG[c.status];
                return (
                  <tr key={c._id} onClick={() => navigate(`/candidates/${c._id}`)}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || '—'}</td>
                    <td>{c.location || '—'}</td>
                    <td>{c.experience?.totalYears ?? 0} yrs</td>
                    <td>
                      <div className="skill-tags-list">
                        {c.skills?.slice(0, 3).map((skill) => (
                          <span key={skill} className="skill-tag">{skill}</span>
                        ))}
                        {(c.skills?.length || 0) > 3 && (
                          <span className="skill-tag" style={{ opacity: 0.6 }}>
                            +{c.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
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
                    <td style={{ textTransform: 'capitalize' }}>{c.source}</td>
                    <td>{formatDate(c.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
