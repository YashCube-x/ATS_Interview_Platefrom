import type { CandidateStatus, JobStatus, InterviewStatus, InterviewRound } from '../types';

/* ────────────────────────────────────────────
   Status color mappings & label helpers
   ──────────────────────────────────────────── */

export const CANDIDATE_STATUS_CONFIG: Record<CandidateStatus, { label: string; color: string; bg?: string }> = {
  applied:        { label: 'Applied',        color: '#3E63DD', bg: '#E7ECFB' },
  reviewed:       { label: 'Reviewed',       color: '#6B7388', bg: '#F3F5FB' },
  shortlisted:    { label: 'Shortlisted',    color: '#B7791F', bg: '#FDF3D9' },
  rejected:       { label: 'Rejected',       color: '#D0364A', bg: '#FCE8EA' },
  selected:       { label: 'Selected',       color: '#1A3181', bg: '#E4ECFC' },
  offer_extended: { label: 'Offer Extended', color: '#4968C8', bg: '#E7ECFB' },
  offer_accepted: { label: 'Offer Accepted', color: '#17915A', bg: '#EBF8F2' },
  offer_declined: { label: 'Offer Declined', color: '#D0364A', bg: '#FCE8EA' },
  onboarding:     { label: 'Onboarding',     color: '#3E63DD', bg: '#E7ECFB' },
  joined:         { label: 'Joined',         color: '#17915A', bg: '#EBF8F2' },
};

export const JOB_STATUS_CONFIG: Record<JobStatus, { label: string; color: string; bg?: string }> = {
  draft:   { label: 'Draft',   color: '#6B7388', bg: '#F3F5FB' },
  open:    { label: 'Open',    color: '#17915A', bg: '#EBF8F2' },
  closed:  { label: 'Closed',  color: '#D0364A', bg: '#FCE8EA' },
  filled:  { label: 'Filled',  color: '#1A3181', bg: '#E4ECFC' },
  on_hold: { label: 'On Hold', color: '#B7791F', bg: '#FDF3D9' },
};

export const INTERVIEW_STATUS_CONFIG: Record<InterviewStatus, { label: string; color: string; bg?: string }> = {
  scheduled:   { label: 'Scheduled',   color: '#3E63DD', bg: '#E7ECFB' },
  completed:   { label: 'Completed',   color: '#17915A', bg: '#EBF8F2' },
  cancelled:   { label: 'Cancelled',   color: '#D0364A', bg: '#FCE8EA' },
  rescheduled: { label: 'Rescheduled', color: '#B7791F', bg: '#FDF3D9' },
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
