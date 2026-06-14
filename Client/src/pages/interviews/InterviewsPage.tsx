import { useState, type FormEvent } from 'react';
import { Calendar, Plus, Clock } from 'lucide-react';
import { interviewsApi } from '../../api/interviews.api';
import { jobsApi } from '../../api/jobs.api';
import { candidatesApi } from '../../api/candidates.api';
import { useFetch } from '../../hooks/useFetch';
import type { Interview, Candidate, Job, InterviewRound } from '../../types';
import { INTERVIEW_STATUS_CONFIG, INTERVIEW_ROUND_LABELS } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function InterviewsPage() {
  const [showCreate, setShowCreate] = useState(false);

  const { data: interviews, isLoading, refetch } = useFetch<Interview[]>(
    () => interviewsApi.list(),
    []
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h2>Scheduled Interviews</h2>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)} id="schedule-interview-btn">
          <Plus size={16} /> Schedule Interview
        </button>
      </div>

      {isLoading ? (
        <div className="page-loader">
          <div className="loader-spinner" />
          <p>Loading interviews...</p>
        </div>
      ) : !interviews || interviews.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} />
          <h3>No interviews scheduled</h3>
          <p className="text-muted">Schedule your first interview</p>
        </div>
      ) : (
        <div className="flex-col gap-2" style={{ display: 'flex' }}>
          {interviews.map((interview) => {
            const statusConfig = INTERVIEW_STATUS_CONFIG[interview.status];
            const candidateObj = interview.candidateId as Candidate;
            const jobObj = interview.jobId as Job;
            const candidateName = typeof candidateObj === 'object' ? candidateObj.name : '—';
            const jobTitle = typeof jobObj === 'object' ? jobObj.title : '—';

            return (
              <div key={interview._id} className="glass-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-md)',
                        background: `${statusConfig.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: statusConfig.color,
                        flexShrink: 0,
                      }}
                    >
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{candidateName}</div>
                      <div className="text-sm text-muted">{jobTitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="badge"
                      style={{ background: `${statusConfig.color}18`, color: statusConfig.color }}
                    >
                      {statusConfig.label}
                    </span>
                    <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                      {INTERVIEW_ROUND_LABELS[interview.round]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-2 text-sm text-muted" style={{ flexWrap: 'wrap' }}>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {formatDateTime(interview.scheduledDate)}
                  </span>
                  {interview.duration && <span>· {interview.duration} min</span>}
                  {interview.interviewerName && <span>· Interviewer: {interview.interviewerName}</span>}
                  {interview.location && <span>· 📍 {interview.location}</span>}
                  {interview.meetingLink && (
                    <a href={interview.meetingLink} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                      🔗 Meeting Link
                    </a>
                  )}
                </div>

                {interview.feedback && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-sm" style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Feedback</div>
                    <p className="text-sm text-muted">{interview.feedback}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateInterviewModal
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

/* ── Create Interview Modal ──────────────────────────── */
function CreateInterviewModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    candidateId: '',
    jobId: '',
    round: 'phone_screening' as InterviewRound,
    scheduledDate: '',
    duration: 60,
    interviewerName: '',
    interviewerEmail: '',
    meetingLink: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: candidates } = useFetch<Candidate[]>(() => candidatesApi.list(), []);
  const { data: jobs } = useFetch<Job[]>(() => jobsApi.list(), []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.candidateId || !form.jobId || !form.scheduledDate) {
      toast.error('Please fill required fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await interviewsApi.create(form);
      toast.success('Interview scheduled!');
      onCreated();
    } catch {
      toast.error('Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Schedule Interview</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label>Candidate *</label>
            <select className="select" value={form.candidateId} onChange={(e) => setForm({ ...form, candidateId: e.target.value })}>
              <option value="">Select candidate</option>
              {candidates?.map((c) => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label>Job *</label>
            <select className="select" value={form.jobId} onChange={(e) => setForm({ ...form, jobId: e.target.value })}>
              <option value="">Select job</option>
              {jobs?.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
            </select>
          </div>

          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            <div className="input-group">
              <label>Round</label>
              <select className="select" value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value as InterviewRound })}>
                <option value="phone_screening">Phone Screening</option>
                <option value="technical">Technical</option>
                <option value="hr">HR</option>
                <option value="final">Final</option>
              </select>
            </div>
            <div className="input-group">
              <label>Duration (min)</label>
              <input type="number" className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label>Date & Time *</label>
            <input type="datetime-local" className="input" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
          </div>

          <div className="grid-2" style={{ marginBottom: '1rem' }}>
            <div className="input-group">
              <label>Interviewer Name</label>
              <input className="input" value={form.interviewerName} onChange={(e) => setForm({ ...form, interviewerName: e.target.value })} />
            </div>
            <div className="input-group">
              <label>Interviewer Email</label>
              <input className="input" type="email" value={form.interviewerEmail} onChange={(e) => setForm({ ...form, interviewerEmail: e.target.value })} />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label>Meeting Link</label>
            <input className="input" placeholder="https://meet.google.com/..." value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
