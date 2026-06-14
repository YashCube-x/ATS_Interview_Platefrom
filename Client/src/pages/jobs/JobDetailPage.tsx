import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Target, Briefcase } from 'lucide-react';
import { jobsApi } from '../../api/jobs.api';
import { matchingApi } from '../../api/matching.api';
import { useFetch } from '../../hooks/useFetch';
import type { Job } from '../../types';
import { JOB_STATUS_CONFIG, JOB_TYPE_LABELS, EDUCATION_LABELS } from '../../utils/constants';
import { formatDate, formatSalary } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isMatching, setIsMatching] = useState(false);

  const { data: job, isLoading } = useFetch<Job>(
    () => jobsApi.getById(id!),
    [id]
  );

  const handleRunMatching = async () => {
    if (!id) return;
    setIsMatching(true);
    try {
      await matchingApi.runMatching(id);
      toast.success('Matching completed! Viewing results...');
      navigate(`/matching/${id}`);
    } catch {
      toast.error('Failed to run matching');
    } finally {
      setIsMatching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-loader">
        <div className="loader-spinner" />
        <p>Loading job...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="empty-state">
        <h3>Job not found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/jobs')}>Back to Jobs</button>
      </div>
    );
  }

  const statusConfig = JOB_STATUS_CONFIG[job.status];

  return (
    <div className="animate-fade-in">
      <button className="btn btn-ghost btn-sm mb-2" onClick={() => navigate('/jobs')}>
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-avatar" style={{ background: `${statusConfig.color}30`, color: statusConfig.color }}>
          <Briefcase size={28} />
        </div>
        <div className="detail-info" style={{ flex: 1 }}>
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <h1>{job.title}</h1>
            <span className="badge" style={{ background: `${statusConfig.color}18`, color: statusConfig.color }}>
              {statusConfig.label}
            </span>
          </div>
          <div className="detail-meta">
            {job.location && <span className="detail-meta-item"><MapPin size={14} /> {job.location}</span>}
            <span className="detail-meta-item"><Briefcase size={14} /> {JOB_TYPE_LABELS[job.jobType] || job.jobType}</span>
            <span className="detail-meta-item"><Calendar size={14} /> Posted {formatDate(job.createdAt)}</span>
          </div>
        </div>

        <div className="flex gap-1" style={{ flexShrink: 0 }}>
          <button
            className="btn btn-primary"
            onClick={handleRunMatching}
            disabled={isMatching}
            id="run-matching-btn"
          >
            <Target size={16} /> {isMatching ? 'Running...' : 'Run AI Matching'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/matching/${id}`)}
          >
            View Results
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left */}
        <div className="flex-col gap-3" style={{ display: 'flex' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '0.75rem' }}>Description</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{job.description}</p>
          </div>

          <div className="glass-card">
            <h3 style={{ marginBottom: '0.75rem' }}>Required Skills</h3>
            <div className="skill-tags-list">
              {job.requiredSkills?.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
            {job.preferredSkills?.length > 0 && (
              <>
                <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Preferred Skills
                </h4>
                <div className="skill-tags-list">
                  {job.preferredSkills.map((skill) => (
                    <span key={skill} className="skill-tag" style={{ opacity: 0.7 }}>{skill}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex-col gap-3" style={{ display: 'flex' }}>
          <div className="glass-card">
            <h3 style={{ marginBottom: '0.75rem' }}>Requirements</h3>
            <div className="flex-col gap-1" style={{ display: 'flex' }}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Min. Experience</span>
                <span>{job.minimumExperience}+ years</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Education</span>
                <span>{EDUCATION_LABELS[job.educationRequirement] || job.educationRequirement}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Salary</span>
                <span style={{ color: 'var(--success)' }}>{formatSalary(job.salary)}</span>
              </div>
            </div>
          </div>

          {job.projectRequirement && (
            <div className="glass-card">
              <h3 style={{ marginBottom: '0.75rem' }}>Project Requirement</h3>
              <p className="text-sm">{job.projectRequirement}</p>
            </div>
          )}

          {job.matchingSummary && (
            <div className="glass-card">
              <h3 style={{ marginBottom: '0.75rem' }}>✨ Matching Summary</h3>
              <p className="text-sm" style={{ lineHeight: 1.7 }}>{job.matchingSummary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
