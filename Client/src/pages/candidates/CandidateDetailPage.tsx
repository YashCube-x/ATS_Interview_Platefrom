import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Star,
  X,
  Trash2,
} from 'lucide-react';
import { candidatesApi } from '../../api/candidates.api';
import { jobsApi } from '../../api/jobs.api';
import { interviewsApi } from '../../api/interviews.api';
import { useFetch } from '../../hooks/useFetch';
import type { Candidate, CandidateStatus, Job, Interview } from '../../types';
import { CANDIDATE_STATUS_CONFIG } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { useState } from 'react';

const INTERVIEWERS = [
  { name: 'Suyash Prakash Singh', email: 'suyashprakashsingh@gmail.com' },
  { name: 'Aditya Sharma', email: 'aditya.sharma@example.com' },
  { name: 'Pooja Patel', email: 'pooja.patel@example.com' },
  { name: 'Vikram Singh', email: 'vikram.singh@example.com' },
  { name: 'Sneha Reddy', email: 'sneha.reddy@example.com' },
];

const statusActions: { status: CandidateStatus; label: string; className: string }[] = [
  { status: 'shortlisted', label: 'Shortlist', className: 'btn-success' },
  { status: 'selected', label: 'Select', className: 'btn-primary' },
  { status: 'rejected', label: 'Reject', className: 'btn-danger' },
];

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);

  // AI Summary read-more expansion state
  const [isAISummaryExpanded, setIsAISummaryExpanded] = useState(false);

  // Side-by-side split resume preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Interview scheduling modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [selectedInterviewerIdx, setSelectedInterviewerIdx] = useState(0);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [meetLink, setMeetLink] = useState('');

  const { data: candidate, isLoading, refetch } = useFetch<Candidate>(
    () => candidatesApi.getById(id!),
    [id]
  );

  const { data: jobs } = useFetch<Job[]>(() => jobsApi.list(), []);

  // Fetch interviews for this candidate
  const { data: interviews, refetch: refetchInterviews } = useFetch<Interview[]>(
    () => interviewsApi.list({ candidateId: id! }),
    [id]
  );

  const handleStatusUpdate = async (newStatus: CandidateStatus) => {
    if (!id) return;

    if (newStatus === 'shortlisted') {
      // Generate fallback meeting link containing ONLY lowercase alphabetic letters (as required by Google Meet)
      const letters = 'abcdefghijklmnopqrstuvwxyz';
      const randStr = (len: number) => Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
      const randomCode = `${randStr(3)}-${randStr(4)}-${randStr(3)}`;
      setMeetLink(`https://meet.google.com/${randomCode}`);

      // Set default scheduled date to tomorrow 10:00 AM local time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      // Convert to local datetime-local input string format (YYYY-MM-DDTHH:MM)
      const tzOffset = tomorrow.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(tomorrow.getTime() - tzOffset)).toISOString().slice(0, 16);
      setInterviewDate(localISOTime);

      // Pre-select first job if jobs exist
      if (jobs && jobs.length > 0) {
        setSelectedJobId(jobs[0]._id);
      }

      setIsModalOpen(true);
      return;
    }

    setUpdating(true);
    try {
      await candidatesApi.updateStatus(id, newStatus);
      toast.success(`Candidate ${newStatus} successfully`);
      refetch();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleScheduleAndShortlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!selectedJobId) {
      toast.error('Please select a job');
      return;
    }
    if (!interviewDate) {
      toast.error('Please select a date and time');
      return;
    }

    setUpdating(true);
    try {
      // 1. Update candidate status to shortlisted
      await candidatesApi.updateStatus(id, 'shortlisted');

      // 2. Create interview scheduling record
      const interviewer = INTERVIEWERS[selectedInterviewerIdx];
      await interviewsApi.create({
        candidateId: id,
        jobId: selectedJobId,
        round: 'technical',
        scheduledDate: new Date(interviewDate).toISOString(),
        interviewerName: interviewer.name,
        interviewerEmail: interviewer.email,
        meetingLink: meetLink,
        duration: 45,
      });

      toast.success('Candidate shortlisted and interview scheduled successfully!');
      setIsModalOpen(false);
      refetch();
      refetchInterviews();
    } catch {
      toast.error('Failed to shortlist candidate and schedule interview');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteInterview = async (interviewId: string) => {
    if (!window.confirm('Are you sure you want to delete/cancel this interview? This will also remove the event from Google Calendar.')) {
      return;
    }

    setUpdating(true);
    try {
      await interviewsApi.delete(interviewId);
      toast.success('Interview deleted successfully!');
      refetchInterviews();
    } catch {
      toast.error('Failed to delete interview');
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-loader">
        <div className="loader-spinner" />
        <p>Loading candidate...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="empty-state">
        <h3>Candidate not found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/candidates')}>
          Back to Candidates
        </button>
      </div>
    );
  }

  const statusConfig = CANDIDATE_STATUS_CONFIG[candidate.status];

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button
        className="btn btn-ghost btn-sm mb-2"
        onClick={() => navigate('/candidates')}
      >
        <ArrowLeft size={16} /> Back to Candidates
      </button>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-avatar">
          {candidate.name.charAt(0).toUpperCase()}
        </div>
        <div className="detail-info" style={{ flex: 1 }}>
          <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
            <h1>{candidate.name}</h1>
            <span
              className="badge"
              style={{ background: `${statusConfig.color}18`, color: statusConfig.color }}
            >
              {statusConfig.label}
            </span>
          </div>
          {candidate.currentJobTitle && (
            <p style={{ fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              {candidate.currentJobTitle}
              {candidate.currentCompany && ` at ${candidate.currentCompany}`}
            </p>
          )}
          <div className="detail-meta">
            <span className="detail-meta-item"><Mail size={14} /> {candidate.email}</span>
            {candidate.phone && <span className="detail-meta-item"><Phone size={14} /> {candidate.phone}</span>}
            {candidate.location && <span className="detail-meta-item"><MapPin size={14} /> {candidate.location}</span>}
            <span className="detail-meta-item"><Calendar size={14} /> Applied {formatDate(candidate.createdAt)}</span>
          </div>
        </div>
        {/* Status Actions */}
        <div className="flex gap-1" style={{ flexShrink: 0 }}>
          {statusActions.map((action) => (
            <button
              key={action.status}
              className={`btn btn-sm ${action.className}`}
              onClick={() => handleStatusUpdate(action.status)}
              disabled={updating || candidate.status === action.status}
            >
              {action.status === 'shortlisted' && <ThumbsUp size={14} />}
              {action.status === 'selected' && <Star size={14} />}
              {action.status === 'rejected' && <ThumbsDown size={14} />}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap', marginTop: '1.5rem' }}>
        {/* Left Column (Candidate details + Interview details) */}
        <div style={{ flex: isPreviewOpen ? '1 1 calc(50% - 0.75rem)' : '1 1 100%', minWidth: 320, display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'all 0.3s ease' }}>
          
          <div className="grid-2" style={{ alignItems: 'start' }}>
            {/* Left Column */}
            <div className="flex-col gap-3" style={{ display: 'flex' }}>
              {/* AI Summary */}
              {candidate.aiSummary && (
                <div className="glass-card detail-section">
                  <h3>✨ AI Summary</h3>
                  <p style={{ marginTop: '0.75rem', lineHeight: 1.7 }}>
                    {isAISummaryExpanded || candidate.aiSummary.length <= 250
                      ? candidate.aiSummary
                      : `${candidate.aiSummary.substring(0, 250)}...`}
                  </p>
                  {candidate.aiSummary.length > 250 && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ marginTop: '0.5rem', color: 'var(--accent-light)', padding: 0, background: 'none' }}
                      onClick={() => setIsAISummaryExpanded(!isAISummaryExpanded)}
                      type="button"
                    >
                      {isAISummaryExpanded ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>
              )}

              {/* Skills */}
              <div className="glass-card detail-section">
                <h3>Skills</h3>
                <div className="skill-tags-list" style={{ marginTop: '0.75rem' }}>
                  {candidate.skills?.map((skill) => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                  {(!candidate.skills || candidate.skills.length === 0) && (
                    <p className="text-muted text-sm">No skills listed</p>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div className="glass-card detail-section">
                <h3>
                  <Briefcase size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Experience — {candidate.experience?.totalYears ?? 0} years
                </h3>
                {candidate.companies?.length > 0 ? (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {candidate.companies.map((company, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '0.75rem',
                          background: 'var(--bg-elevated)',
                          borderRadius: 'var(--radius-md)',
                        }}
                      >
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          {company.role}
                        </div>
                        <div className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
                          {company.companyName}
                          {company.duration && ` · ${company.duration}`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-sm" style={{ marginTop: '0.75rem' }}>No experience listed</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-col gap-3" style={{ display: 'flex' }}>
              {/* Education */}
              <div className="glass-card detail-section">
                <h3><GraduationCap size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> Education</h3>
                {candidate.education ? (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {candidate.education.course}
                    </div>
                    <div className="text-sm text-muted">
                      {candidate.education.collegeName}
                      {candidate.education.passingYear && ` · ${candidate.education.passingYear}`}
                      {candidate.education.cgpa && ` · CGPA: ${candidate.education.cgpa}`}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted text-sm" style={{ marginTop: '0.75rem' }}>No education listed</p>
                )}
              </div>

              {/* Links */}
              <div className="glass-card detail-section">
                <h3>Links</h3>
                <div className="flex-col gap-1" style={{ display: 'flex', marginTop: '0.75rem' }}>
                  {candidate.resumeUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                        className="flex items-center gap-1 text-sm btn btn-ghost"
                        style={{ padding: '4px 8px', color: 'var(--accent-light)', border: '1px solid var(--border)', background: 'none' }}
                        type="button"
                      >
                        <ExternalLink size={14} />
                        <span>{isPreviewOpen ? 'Close Split Resume' : 'View Split Resume'}</span>
                      </button>
                      <a
                        href={candidate.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted"
                        style={{ textDecoration: 'underline' }}
                      >
                        (Open in new tab ↗)
                      </a>
                    </div>
                  )}
                  {candidate.linkedinUrl && (
                    <a
                      href={candidate.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sm"
                    >
                      <ExternalLink size={14} /> LinkedIn
                    </a>
                  )}
                  {candidate.portfolioUrl && (
                    <a
                      href={candidate.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sm"
                    >
                      <ExternalLink size={14} /> Portfolio
                    </a>
                  )}
                  {!candidate.resumeUrl && !candidate.linkedinUrl && !candidate.portfolioUrl && (
                    <p className="text-muted text-sm">No links available</p>
                  )}
                </div>
              </div>

              {/* Ratings */}
              {candidate.ratings && (
                <div className="glass-card detail-section">
                  <h3>Ratings</h3>
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(['technicalSkills', 'communication', 'cultureFit', 'overall'] as const).map((key) => {
                      const val = candidate.ratings?.[key];
                      if (val == null) return null;
                      const label = key === 'technicalSkills' ? 'Technical' : key === 'cultureFit' ? 'Culture Fit' : key.charAt(0).toUpperCase() + key.slice(1);
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>{label}</span>
                            <span style={{ color: 'var(--accent-light)' }}>{val}/5</span>
                          </div>
                          <div className="score-bar-track">
                            <div
                              className="score-bar-fill"
                              style={{ width: `${(val / 5) * 100}%`, background: 'var(--accent)' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              {candidate.notes && (
                <div className="glass-card detail-section">
                  <h3>Notes</h3>
                  <p className="text-sm" style={{ marginTop: '0.75rem', whiteSpace: 'pre-wrap' }}>
                    {candidate.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Interview Details Section */}
          {interviews && interviews.length > 0 && (
            <div className="glass-card detail-section" style={{ marginTop: '0.5rem' }}>
              <h3>📅 Scheduled Interviews</h3>
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {interviews.map((interview) => {
                  const jobTitle = typeof interview.jobId === 'object' ? (interview.jobId as Job).title : 'Job';
                  return (
                    <div
                      key={interview._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'var(--bg-elevated)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', textTransform: 'capitalize' }}>
                          {interview.round.replace('_', ' ')} Round — {jobTitle}
                        </div>
                        <div className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
                          <strong>Date & Time:</strong> {new Date(interview.scheduledDate).toLocaleString()}
                        </div>
                        {interview.interviewerName && (
                          <div className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>
                            <strong>Interviewer:</strong> {interview.interviewerName} ({interview.interviewerEmail})
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {interview.meetingLink && (
                          <a
                            href={interview.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            Join Google Meet
                          </a>
                        )}
                        <span
                          className="badge"
                          style={{
                            background:
                              interview.status === 'scheduled'
                                ? 'rgba(0, 214, 143, 0.15)'
                                : interview.status === 'completed'
                                ? 'rgba(0, 180, 216, 0.15)'
                                : 'rgba(255, 107, 107, 0.15)',
                            color:
                              interview.status === 'scheduled'
                                ? 'var(--success)'
                                : interview.status === 'completed'
                                ? 'var(--accent)'
                                : 'var(--danger)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {interview.status}
                        </span>
                        <button
                          onClick={() => handleDeleteInterview(interview._id)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '0.375rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          disabled={updating}
                          title="Delete Interview"
                          type="button"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Resume Preview) */}
        {isPreviewOpen && (
          <div
            style={{
              flex: '1 1 calc(50% - 0.75rem)',
              minWidth: 320,
              position: 'sticky',
              top: '80px',
              height: 'calc(100vh - 110px)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              padding: '0.5rem 0.75rem 0.75rem 0.75rem',
            }}
            className="glass-card"
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.375rem',
                paddingBottom: '0.375rem',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Resume Preview</h3>
                <div className="text-xs text-muted" style={{ fontSize: '0.75rem' }}>{candidate.name}</div>
              </div>
              <button
                className="btn btn-icon btn-ghost btn-sm"
                onClick={() => setIsPreviewOpen(false)}
                title="Close resume preview"
                style={{ padding: '4px' }}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            {/* PDF Viewer Body */}
            <div style={{ flex: 1, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#f8f9fa', border: '1px solid var(--border)' }}>
              {candidate.resumeUrl ? (
                <iframe
                  src={`${candidate.resumeUrl}#toolbar=0&navpanes=0&view=FitH`}
                  title={`${candidate.name} Resume`}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', display: 'block' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>
                  <Briefcase size={36} style={{ opacity: 0.5 }} />
                  <div>No PDF resume URL available.</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ margin: 0 }}>Arrange Interview Meeting</h2>
              <button
                className="btn btn-icon btn-ghost btn-sm"
                onClick={() => setIsModalOpen(false)}
                type="button"
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleScheduleAndShortlist} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label htmlFor="interview-job">Select Job</label>
                <select
                  id="interview-job"
                  className="select"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  required
                >
                  <option value="">— Choose a Job —</option>
                  {jobs?.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="interview-date">Date & Time</label>
                <input
                  type="datetime-local"
                  id="interview-date"
                  className="input"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="interview-interviewer">Select Interviewer</label>
                <select
                  id="interview-interviewer"
                  className="select"
                  value={selectedInterviewerIdx}
                  onChange={(e) => setSelectedInterviewerIdx(Number(e.target.value))}
                  required
                >
                  {INTERVIEWERS.map((interviewer, idx) => (
                    <option key={idx} value={idx}>
                      {interviewer.name} ({interviewer.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="interview-meet-link">Google Meet Link</label>
                <input
                  type="text"
                  id="interview-meet-link"
                  className="input"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  required
                />
                <small className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  * This Google Meet link is auto-generated but you can override it if you want.
                </small>
              </div>

              <div className="modal-footer" style={{ margin: 0, padding: '1rem 0 0 0' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? 'Scheduling...' : 'Schedule & Shortlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
