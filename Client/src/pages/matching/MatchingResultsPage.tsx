import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Search, FileText, X } from 'lucide-react';
import { jobsApi } from '../../api/jobs.api';
import { matchingApi } from '../../api/matching.api';
import { useFetch } from '../../hooks/useFetch';
import type { Job, MatchingResult, Candidate } from '../../types';
import { JOB_STATUS_CONFIG } from '../../utils/constants';
import toast from 'react-hot-toast';

export default function MatchingPage() {
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [results, setResults] = useState<MatchingResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [previewCandidate, setPreviewCandidate] = useState<Candidate | null>(null);

  const { data: jobs, isLoading: jobsLoading } = useFetch<Job[]>(() => jobsApi.list(), []);

  const handleRunMatching = async () => {
    if (!selectedJobId) {
      toast.error('Please select a job first');
      return;
    }
    setIsRunning(true);
    setPreviewCandidate(null);
    try {
      await matchingApi.runMatching(selectedJobId);
      toast.success('Matching complete!');
      await loadResults();
    } catch {
      toast.error('Matching failed');
    } finally {
      setIsRunning(false);
    }
  };

  const loadResults = async () => {
    if (!selectedJobId) return;
    setIsLoadingResults(true);
    try {
      const { data } = await matchingApi.getResults(selectedJobId);
      const resData = data.data as any;
      if (resData && Array.isArray(resData.results)) {
        setResults(resData.results);
      } else if (Array.isArray(resData)) {
        setResults(resData);
      } else {
        setResults([]);
      }
    } catch {
      toast.error('Failed to load results');
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleJobSelect = async (jobId: string) => {
    setSelectedJobId(jobId);
    setResults(null);
    setPreviewCandidate(null);
    if (jobId) {
      setIsLoadingResults(true);
      try {
        const { data } = await matchingApi.getResults(jobId);
        const resData = data.data as any;
        if (resData && Array.isArray(resData.results)) {
          setResults(resData.results);
        } else if (Array.isArray(resData)) {
          setResults(resData);
        } else {
          setResults([]);
        }
      } catch {
        // No results yet
        setResults([]);
      } finally {
        setIsLoadingResults(false);
      }
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Left Column (Job Selection + Candidates List / Loading states) */}
        <div
          style={{
            flex: previewCandidate ? '1 1 calc(50% - 0.75rem)' : '1 1 100%',
            minWidth: 320,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            transition: 'all 0.3s ease',
          }}
        >
          {/* Job Selection */}
          <div className="glass-card">
            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
              <div className="input-group" style={{ flex: 1, minWidth: 280 }}>
                <label>Select Job for Matching</label>
                <select
                  className="select"
                  value={selectedJobId}
                  onChange={(e) => handleJobSelect(e.target.value)}
                  id="matching-job-select"
                >
                  <option value="">— Choose a job —</option>
                  {!jobsLoading &&
                    jobs?.map((job) => (
                      <option key={job._id} value={job._id}>
                        {job.title} ({JOB_STATUS_CONFIG[job.status].label})
                      </option>
                    ))}
                </select>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleRunMatching}
                disabled={!selectedJobId || isRunning}
                style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                id="run-matching-btn"
              >
                {isRunning ? (
                  <div className="loader-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Target size={16} />
                )}
                {isRunning ? 'Running AI...' : 'Run AI Matching'}
              </button>
            </div>
          </div>

          {/* Results Dynamic Content */}
          {isRunning ? (
            <div className="page-loader" style={{ marginTop: '0.5rem' }}>
              <div className="loader-spinner" />
              <p>AI is scanning resumes and calculating matching scores... Please wait.</p>
            </div>
          ) : isLoadingResults ? (
            <div className="page-loader">
              <div className="loader-spinner" />
              <p>Loading results...</p>
            </div>
          ) : results !== null && results.length === 0 ? (
            <div className="empty-state">
              <Search size={48} />
              <h3>No matching results yet</h3>
              <p className="text-muted">Click "Run AI Matching" to find the best candidates for this job</p>
            </div>
          ) : results && results.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3>{results.length} Candidates Ranked</h3>
              {results.map((result, index) => {
                const candidate = result.candidateId as Candidate;
                const candidateName = typeof candidate === 'object' ? candidate.name : 'Candidate';
                const candidateEmail = typeof candidate === 'object' ? candidate.email : '';
                const candidateIdStr = typeof candidate === 'object' ? candidate._id : String(result.candidateId);
                const isCurrentlyPreviewed = previewCandidate?._id === candidateIdStr;

                return (
                  <div
                    key={result._id}
                    className="glass-card"
                    style={{
                      cursor: 'pointer',
                      border: isCurrentlyPreviewed ? '1px solid var(--accent)' : undefined,
                      boxShadow: isCurrentlyPreviewed ? 'var(--accent-glow-strong)' : undefined
                    }}
                    onClick={() => navigate(`/candidates/${candidateIdStr}`)}
                  >
                    <div className="flex items-center gap-2">
                      {/* Rank */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 'var(--radius-md)',
                          background: index < 3 ? 'var(--accent-glow)' : 'var(--bg-elevated)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: index < 3 ? 'var(--accent-light)' : 'var(--text-muted)',
                          flexShrink: 0,
                        }}
                      >
                        #{index + 1}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{candidateName}</div>
                        <div className="text-sm text-muted">{candidateEmail}</div>
                      </div>

                      {/* Action Panel: View Resume & Score */}
                      <div className="flex items-center gap-4" style={{ flexShrink: 0 }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            color: isCurrentlyPreviewed ? 'var(--accent-light)' : 'var(--text-muted)',
                            borderColor: isCurrentlyPreviewed ? 'var(--accent)' : 'var(--border-color)',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            background: isCurrentlyPreviewed ? 'var(--accent-glow)' : 'transparent',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurrentlyPreviewed) {
                              setPreviewCandidate(null);
                            } else {
                              setPreviewCandidate(candidate);
                            }
                          }}
                          title="View resume side-by-side"
                        >
                          <FileText size={14} />
                          <span>{isCurrentlyPreviewed ? 'Close' : 'View Resume'}</span>
                        </button>

                        <div style={{ textAlign: 'right' }}>
                          <div
                            style={{
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              color: scoreColor(result.finalScore),
                            }}
                          >
                            {result.finalScore.toFixed(1)}
                          </div>
                          <div className="text-sm text-muted">Final Score</div>
                        </div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="grid-3" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(5, 1fr)' }}>
                      {[
                        { label: 'Semantic', value: result.semanticScore },
                        { label: 'Skills', value: result.skillScore },
                        { label: 'Experience', value: result.experienceScore },
                        { label: 'Projects', value: result.projectScore },
                        { label: 'Education', value: result.educationScore },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="text-sm text-muted" style={{ marginBottom: '0.25rem' }}>
                            {item.label}
                          </div>
                          <div className="score-bar-track">
                            <div
                              className="score-bar-fill"
                              style={{
                                width: `${item.value}%`,
                                background: scoreColor(item.value),
                              }}
                            />
                          </div>
                          <div className="text-sm" style={{ marginTop: '0.25rem', fontWeight: 500 }}>
                            {item.value.toFixed(0)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Matched/Unmatched Skills */}
                    {(result.matchedSkills?.length || result.unmatchedSkills?.length) && (
                      <div className="flex gap-2 mt-2" style={{ flexWrap: 'wrap' }}>
                        {result.matchedSkills?.map((s) => (
                          <span key={s} className="skill-tag" style={{ borderColor: 'rgba(0,214,143,0.3)', color: 'var(--success)' }}>
                            ✓ {s}
                          </span>
                        ))}
                        {result.unmatchedSkills?.map((s) => (
                          <span key={s} className="skill-tag" style={{ borderColor: 'rgba(255,107,107,0.3)', color: 'var(--danger)', opacity: 0.6 }}>
                            ✗ {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Right Column (Resume Preview) */}
        {previewCandidate && (
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
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{previewCandidate.name}</h3>
                <div className="text-xs text-muted" style={{ fontSize: '0.75rem' }}>{previewCandidate.email}</div>
              </div>
              <button
                className="btn btn-icon btn-ghost btn-sm"
                onClick={() => setPreviewCandidate(null)}
                title="Close resume preview"
                style={{ padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* PDF Viewer Body */}
            <div style={{ flex: 1, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#f8f9fa', border: '1px solid var(--border)' }}>
              {previewCandidate.resumeUrl ? (
                <iframe
                  src={`${previewCandidate.resumeUrl}#toolbar=0&navpanes=0&view=FitH`}
                  title={`${previewCandidate.name} Resume`}
                  width="100%"
                  height="100%"
                  style={{ border: 'none', display: 'block' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>
                  <FileText size={36} style={{ opacity: 0.5 }} />
                  <div>No PDF resume URL available.</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
