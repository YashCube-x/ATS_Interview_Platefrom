import type { CandidateStatus, JobStatus, InterviewStatus, InterviewRound } from '../types';

/* ────────────────────────────────────────────
   Status color mappings & label helpers
   ──────────────────────────────────────────── */

export const CANDIDATE_STATUS_CONFIG: Record<CandidateStatus, { label: string; color: string }> = {
  applied:        { label: 'Applied',        color: 'var(--info)' },
  reviewed:       { label: 'Reviewed',       color: 'var(--text-secondary)' },
  shortlisted:    { label: 'Shortlisted',    color: 'var(--warning)' },
  rejected:       { label: 'Rejected',       color: 'var(--danger)' },
  selected:       { label: 'Selected',       color: 'var(--accent)' },
  offer_extended: { label: 'Offer Extended', color: 'var(--accent-light)' },
  offer_accepted: { label: 'Offer Accepted', color: 'var(--success)' },
  offer_declined: { label: 'Offer Declined', color: 'var(--danger)' },
  onboarding:     { label: 'Onboarding',     color: 'var(--info)' },
  joined:         { label: 'Joined',         color: 'var(--success)' },
};

export const JOB_STATUS_CONFIG: Record<JobStatus, { label: string; color: string }> = {
  draft:   { label: 'Draft',   color: 'var(--text-secondary)' },
  open:    { label: 'Open',    color: 'var(--success)' },
  closed:  { label: 'Closed',  color: 'var(--danger)' },
  filled:  { label: 'Filled',  color: 'var(--accent)' },
  on_hold: { label: 'On Hold', color: 'var(--warning)' },
};

export const INTERVIEW_STATUS_CONFIG: Record<InterviewStatus, { label: string; color: string }> = {
  scheduled:   { label: 'Scheduled',   color: 'var(--info)' },
  completed:   { label: 'Completed',   color: 'var(--success)' },
  cancelled:   { label: 'Cancelled',   color: 'var(--danger)' },
  rescheduled: { label: 'Rescheduled', color: 'var(--warning)' },
};

export const INTERVIEW_ROUND_LABELS: Record<InterviewRound, string> = {
  phone_screening: 'Phone Screening',
  technical:       'Technical',
  hr:              'HR',
  final:           'Final',
};

export const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract:  'Contract',
  intern:    'Intern',
};

export const EDUCATION_LABELS: Record<string, string> = {
  high_school: 'High School',
  bachelors:   "Bachelor's",
  masters:     "Master's",
  phd:         'PhD',
};
