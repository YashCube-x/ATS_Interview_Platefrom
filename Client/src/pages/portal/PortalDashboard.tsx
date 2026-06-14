import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, FileCheck, LogOut, Check, ExternalLink, HelpCircle } from 'lucide-react';
import { portalApi } from '../../api/portal.api';
import { formatDateTime } from '../../utils/formatters';
import { INTERVIEW_ROUND_LABELS } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function PortalDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [status, setStatus] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('portalToken');
    if (!token) {
      navigate('/portal');
      return;
    }
    const load = async () => {
      try {
        const [profileRes, statusRes] = await Promise.all([
          portalApi.getProfile(),
          portalApi.getStatus(),
        ]);
        setProfile(profileRes.data.data as Record<string, any>);
        setStatus(statusRes.data.data as Record<string, any>);
      } catch {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('portalToken');
        navigate('/portal');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('portalToken');
    navigate('/portal');
  };

  if (isLoading) {
    return (
      <div className="page-loader" style={{ minHeight: '100vh' }}>
        <div className="loader-spinner" />
        <p>Loading your portal...</p>
      </div>
    );
  }

  const candidateStatus = status?.status || 'applied';

  // Define steps
  const steps = [
    { key: 'applied', label: 'Applied', desc: 'Resume received' },
    { key: 'reviewed', label: 'Under Review', desc: 'Screening credentials' },
    { key: 'shortlisted', label: 'Shortlisted', desc: 'Interviews scheduled' },
    { key: 'selected', label: 'Decision', desc: 'Offer finalized' },
  ];

  const getStepState = (stepKey: string, currentStatus: string) => {
    const statusOrder = ['applied', 'reviewed', 'shortlisted', 'selected', 'joined'];
    
    // Handle rejected state
    if (currentStatus === 'rejected') {
      if (stepKey === 'selected') return 'rejected';
      const currentIdx = statusOrder.indexOf('shortlisted');
      const stepIdx = statusOrder.indexOf(stepKey);
      return stepIdx <= currentIdx ? 'completed' : 'pending';
    }

    const currentIdx = statusOrder.indexOf(currentStatus === 'joined' ? 'selected' : currentStatus);
    const stepIdx = statusOrder.indexOf(stepKey);

    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '3rem 2rem' }}>
      <div style={{ maxWidth: 850, margin: '0 auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '2.5rem' }}>
          <div className="flex items-center gap-2">
            <div
              className="sidebar-brand-icon"
              style={{ width: '38px', height: '38px' }}
            >
              <img
                src="/logo.png"
                alt="AshtaTech Logo"
                style={{
                  width: '100%',
                  height: '135%',
                  objectFit: 'cover',
                  objectPosition: 'top',
                }}
              />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Candidate Portal</h2>
              <p className="text-sm text-muted" style={{ margin: 0 }}>Welcome back, {profile?.name || 'Candidate'}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ border: '1px solid var(--border)' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        {/* Stepper Status Dashboard */}
        <div className="glass-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div className="flex items-center gap-1 mb-3">
            <FileCheck size={18} style={{ color: 'var(--accent)' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Application Pipeline</h3>
          </div>
          
          <div className="flex justify-between items-start" style={{ position: 'relative', marginTop: '2.5rem', flexWrap: 'wrap', gap: '2rem' }}>
            {/* Stepper connector line (Desktop only) */}
            <div 
              style={{
                position: 'absolute',
                top: '16px',
                left: '4%',
                right: '4%',
                height: '2px',
                background: 'var(--border)',
                zIndex: 1,
              }}
              className="desktop-only"
            />

            {steps.map((step, index) => {
              const state = getStepState(step.key, candidateStatus);
              let iconBackground = 'var(--bg-elevated)';
              let iconColor = 'var(--text-muted)';
              let iconBorder = '2px solid var(--border)';
              let titleColor = 'var(--text-secondary)';
              let stepIcon = <span>{index + 1}</span>;

              if (state === 'completed') {
                iconBackground = 'var(--success)';
                iconColor = '#070d19';
                iconBorder = '2px solid var(--success)';
                titleColor = 'var(--text-primary)';
                stepIcon = <Check size={16} strokeWidth={3} />;
              } else if (state === 'active') {
                iconBackground = 'var(--accent-glow)';
                iconColor = 'var(--accent-light)';
                iconBorder = '2px solid var(--accent)';
                titleColor = 'var(--accent-light)';
              } else if (state === 'rejected') {
                iconBackground = 'var(--danger)';
                iconColor = '#fff';
                iconBorder = '2px solid var(--danger)';
                titleColor = 'var(--danger)';
                stepIcon = <span>✗</span>;
              }

              return (
                <div 
                  key={step.key} 
                  style={{
                    flex: '1 1 150px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    zIndex: 2,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: iconBackground,
                      color: iconColor,
                      border: iconBorder,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      boxShadow: state === 'active' ? '0 0 16px var(--accent-glow)' : 'none',
                      transition: 'all 200ms ease',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {stepIcon}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: titleColor }}>{step.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {state === 'rejected' ? 'Application Rejected' : step.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: 'start', gap: '1.5rem' }}>
          {/* Profile Card */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div className="flex items-center gap-1 mb-2">
              <User size={18} style={{ color: 'var(--accent)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Candidate Details</h3>
            </div>
            {profile ? (
              <div className="flex-col gap-1 text-sm" style={{ display: 'flex', marginTop: '1rem' }}>
                <div className="flex items-center justify-between" style={{ padding: '0.375rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span className="text-muted">Name</span>
                  <span style={{ fontWeight: 500 }}>{profile.name}</span>
                </div>
                <div className="flex items-center justify-between" style={{ padding: '0.375rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span className="text-muted">Email</span>
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center justify-between" style={{ padding: '0.375rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span className="text-muted">Phone</span>
                  <span>{profile.phone || '—'}</span>
                </div>
                <div className="flex items-center justify-between" style={{ padding: '0.375rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span className="text-muted">Location</span>
                  <span>{profile.location || '—'}</span>
                </div>
                <div className="flex items-center justify-between" style={{ padding: '0.375rem 0' }}>
                  <span className="text-muted">Experience</span>
                  <span>{profile.experience?.totalYears ?? 0} yrs</span>
                </div>
              </div>
            ) : (
              <p className="text-muted">No profile data available</p>
            )}
          </div>

          {/* Job Overview */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div className="flex items-center gap-1 mb-2">
              <HelpCircle size={18} style={{ color: 'var(--accent-light)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Application Status</h3>
            </div>
            <div className="flex-col gap-1 text-sm" style={{ display: 'flex', marginTop: '1rem' }}>
              <div className="flex items-center justify-between" style={{ padding: '0.375rem 0', borderBottom: '1px solid var(--border)' }}>
                <span className="text-muted">Applied Position</span>
                <span style={{ fontWeight: 500, color: 'var(--accent-light)' }}>{status?.jobTitle || 'Design Engineer'}</span>
              </div>
              <div className="flex items-center justify-between" style={{ padding: '0.375rem 0', borderBottom: '1px solid var(--border)' }}>
                <span className="text-muted">Current Stage</span>
                <span 
                  className="badge" 
                  style={{
                    background: candidateStatus === 'rejected' ? 'rgba(255,107,107,0.12)' : 'rgba(0,180,216,0.12)',
                    color: candidateStatus === 'rejected' ? 'var(--danger)' : 'var(--accent-light)'
                  }}
                >
                  {candidateStatus.charAt(0).toUpperCase() + candidateStatus.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between" style={{ padding: '0.375rem 0' }}>
                <span className="text-muted">Last Updated</span>
                <span>{status?.appliedAt ? new Date(status.appliedAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interviews Card */}
        <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
          <div className="flex items-center gap-1 mb-2">
            <Calendar size={18} style={{ color: 'var(--info)' }} />
            <h3 style={{ margin: 0, fontSize: '1rem' }}>My Interview Schedule</h3>
          </div>
          
          {status?.interviews && status.interviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {status.interviews.map((interview: any) => (
                <div 
                  key={interview._id} 
                  style={{ 
                    padding: '1rem', 
                    background: 'var(--bg-elevated)', 
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {INTERVIEW_ROUND_LABELS[interview.round as keyof typeof INTERVIEW_ROUND_LABELS] || 'Technical Round'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {formatDateTime(interview.scheduledDate)} ({interview.duration || 60} mins)
                    </div>
                    {interview.interviewerName && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                        Interviewer: {interview.interviewerName}
                      </div>
                    )}
                  </div>
                  
                  {interview.meetingLink && (
                    <a 
                      href={interview.meetingLink} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                    >
                      <ExternalLink size={14} /> Join Call
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm" style={{ marginTop: '1rem', textAlign: 'center', padding: '1.5rem 0' }}>
              No interviews scheduled yet. You will be notified here once the HR team initiates scheduling.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
