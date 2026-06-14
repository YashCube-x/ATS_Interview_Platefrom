import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Briefcase, Search } from 'lucide-react';
import { jobsApi } from '../../api/jobs.api';
import { useFetch } from '../../hooks/useFetch';
import type { Job, JobStatus, JobFormData } from '../../types';
import { JOB_STATUS_CONFIG, JOB_TYPE_LABELS } from '../../utils/constants';
import { formatDate, formatSalary, truncate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const statusTabs: (JobStatus | 'all')[] = ['all', 'draft', 'open', 'closed', 'filled', 'on_hold'];
const VALID_JOB_STATUSES = new Set(statusTabs);

export default function JobsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') as JobStatus | 'all';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>(
    VALID_JOB_STATUSES.has(initialStatus) ? initialStatus : 'all'
  );
  const [showCreate, setShowCreate] = useState(false);

  const { data: jobs, isLoading, refetch } = useFetch<Job[]>(() => jobsApi.list(), []);

  const filtered = (jobs || []).filter((j) => {
    const matchesSearch =
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.location?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-2">
          <div className="search-input-wrapper" style={{ minWidth: 280 }}>
            <Search />
            <input
              type="text"
              className="input"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="job-search"
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)} id="create-job-btn">
          <Plus size={16} /> Create Job
        </button>
      </div>

      {/* Status Tabs */}
      <div className="tabs" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        {statusTabs.map((s) => (
          <button
            key={s}
            className={`tab${statusFilter === s ? ' active' : ''}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all' ? 'All' : JOB_STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="page-loader">
          <div className="loader-spinner" />
          <p>Loading jobs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} />
          <h3>No jobs found</h3>
          <p className="text-muted">Create your first job posting</p>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Job
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((job) => {
            const statusConfig = JOB_STATUS_CONFIG[job.status];
            return (
              <div
                key={job._id}
                className="glass-card"
                onClick={() => navigate(`/jobs/${job._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="badge"
                    style={{ background: `${statusConfig.color}18`, color: statusConfig.color }}
                  >
                    {statusConfig.label}
                  </span>
                  <span className="text-sm text-muted">{formatDate(job.createdAt)}</span>
                </div>
                <h3 style={{ marginTop: '0.5rem' }}>{job.title}</h3>
                <p className="text-sm text-muted" style={{ marginTop: '0.375rem' }}>
                  {truncate(job.description, 100)}
                </p>
                <div className="flex items-center gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
                  {job.location && (
                    <span className="text-sm text-muted">📍 {job.location}</span>
                  )}
                  <span className="text-sm text-muted">
                    💼 {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                  </span>
                  <span className="text-sm text-muted">
                    📊 {job.minimumExperience}+ yrs
                  </span>
                </div>
                {job.salary && (
                  <div className="text-sm" style={{ marginTop: '0.5rem', color: 'var(--success)' }}>
                    {formatSalary(job.salary)}
                  </div>
                )}
                <div className="skill-tags-list" style={{ marginTop: '0.75rem' }}>
                  {job.requiredSkills?.slice(0, 4).map((skill) => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Job Modal */}
      {showCreate && (
        <CreateJobModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

/* ── Create Job Modal ────────────────────────────────── */
function CreateJobModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<JobFormData>({
    title: '',
    description: '',
    requiredSkills: [],
    preferredSkills: [],
    minimumExperience: 0,
    educationRequirement: 'bachelors',
    location: '',
    jobType: 'full_time',
  });
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error('Title and description are required');
      return;
    }
    setIsSubmitting(true);
    try {
      await jobsApi.create(form);
      toast.success('Job created successfully!');
      onCreated();
    } catch {
      toast.error('Failed to create job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.requiredSkills.includes(skillInput.trim())) {
      setForm({ ...form, requiredSkills: [...form.requiredSkills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2>Create New Job</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label>Job Title *</label>
            <input
              className="input"
              placeholder="e.g. Senior React Developer"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              id="job-title-input"
            />
          </div>

          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label>Description *</label>
            <textarea
              className="textarea"
              placeholder="Job description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              id="job-description-input"
            />
          </div>

          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            <div className="input-group">
              <label>Location</label>
              <input
                className="input"
                placeholder="e.g. Remote, NYC"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label>Job Type</label>
              <select
                className="select"
                value={form.jobType}
                onChange={(e) => setForm({ ...form, jobType: e.target.value as JobFormData['jobType'] })}
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            <div className="input-group">
              <label>Min. Experience (years)</label>
              <input
                type="number"
                className="input"
                min={0}
                value={form.minimumExperience}
                onChange={(e) => setForm({ ...form, minimumExperience: Number(e.target.value) })}
              />
            </div>
            <div className="input-group">
              <label>Education</label>
              <select
                className="select"
                value={form.educationRequirement}
                onChange={(e) => setForm({ ...form, educationRequirement: e.target.value as JobFormData['educationRequirement'] })}
              >
                <option value="high_school">High School</option>
                <option value="bachelors">Bachelor's</option>
                <option value="masters">Master's</option>
                <option value="phd">PhD</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label>Required Skills</label>
            <div className="flex gap-1">
              <input
                className="input"
                placeholder="Type a skill and press Add"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button type="button" className="btn btn-secondary" onClick={addSkill}>Add</button>
            </div>
            <div className="skill-tags-list" style={{ marginTop: '0.5rem' }}>
              {form.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="skill-tag"
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    setForm({
                      ...form,
                      requiredSkills: form.requiredSkills.filter((s) => s !== skill),
                    })
                  }
                >
                  {skill} ✕
                </span>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} id="job-submit-btn">
              {isSubmitting ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
