import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { resumesApi } from '../../api/resumes.api';
import toast from 'react-hot-toast';

export default function ResumeUploadPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  const handleFile = (f: File) => {
    if (!validTypes.includes(f.type)) {
      toast.error('Only PDF, DOCX, and TXT files are supported');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      const { data } = await resumesApi.upload(file);
      setResult(data.data as Record<string, unknown>);
      toast.success(data.message || 'Resume uploaded & processed!');
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Upload Resume</h2>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Upload a resume to automatically parse and create a candidate profile using AI
      </p>

      {/* Drop zone */}
      <div
        className={`file-upload-zone${isDragOver ? ' dragover' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        id="resume-drop-zone"
      >
        <Upload size={48} />
        <h3 style={{ color: 'var(--text-primary)' }}>
          {file ? file.name : 'Drop your resume here'}
        </h3>
        <p className="text-sm text-muted">
          {file
            ? `${(file.size / 1024).toFixed(1)} KB — Click to change`
            : 'or click to browse • PDF, DOCX, TXT • Max 5MB'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleChange}
          style={{ display: 'none' }}
          id="resume-file-input"
        />
      </div>

      {/* Upload button */}
      {file && !result && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleUpload}
            disabled={isUploading}
            id="resume-upload-btn"
          >
            {isUploading ? (
              <>
                <div className="loader-spinner" style={{ width: 18, height: 18 }} />
                Processing...
              </>
            ) : (
              <>
                <Upload size={18} /> Upload & Process
              </>
            )}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="glass-card" style={{ marginTop: '2rem' }}>
          <div className="flex items-center gap-1 mb-2">
            <CheckCircle size={20} style={{ color: 'var(--success)' }} />
            <h3>Resume Processed Successfully</h3>
          </div>

          <div className="flex-col gap-1" style={{ display: 'flex' }}>
            {renderResultField('Name', getResultField(result, 'name'))}
            {renderResultField('Email', getResultField(result, 'email'))}
            {renderResultField('Phone', getResultField(result, 'phone'))}

            {(() => {
              const skills = getResultField(result, 'skills') as string[] | undefined;
              if (!skills || !Array.isArray(skills)) return null;
              return (
                <div style={{ marginTop: '0.5rem' }}>
                  <span className="text-sm text-muted">Skills:</span>
                  <div className="skill-tags-list" style={{ marginTop: '0.375rem' }}>
                    {skills.map((s: string) => (
                      <span key={s} className="skill-tag">{s}</span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
            >
              Upload Another
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="glass-card" style={{ marginTop: '2rem' }}>
        <div className="flex items-center gap-1 mb-1">
          <AlertCircle size={16} style={{ color: 'var(--info)' }} />
          <span className="text-sm" style={{ fontWeight: 500 }}>How it works</span>
        </div>
        <div className="flex-col gap-1 text-sm text-muted" style={{ display: 'flex' }}>
          <div className="flex items-center gap-1">
            <FileText size={14} /> 1. Upload a PDF, DOCX, or TXT resume file
          </div>
          <div className="flex items-center gap-1">
            <span style={{ color: 'var(--accent-light)' }}>✨</span> 2. AI extracts candidate info (name, skills, experience)
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle size={14} /> 3. Candidate profile is created and indexed for matching
          </div>
        </div>
      </div>
    </div>
  );
}

function getResultField(result: Record<string, unknown>, field: string): unknown {
  if (result[field]) return result[field];
  const candidate = result.candidate as Record<string, unknown> | undefined;
  return candidate?.[field];
}

function renderResultField(label: string, value: unknown) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span style={{ color: 'var(--text-primary)' }}>{String(value)}</span>
    </div>
  );
}
