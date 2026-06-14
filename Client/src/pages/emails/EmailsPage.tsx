import { useState } from 'react';
import { Mail, Inbox } from 'lucide-react';
import { emailsApi } from '../../api/emails.api';
import toast from 'react-hot-toast';

export default function EmailsPage() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  const handleSend = async () => {
    if (!to || !subject || !body) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSending(true);
    try {
      await emailsApi.send({ to, subject, body });
      toast.success('Email sent successfully!');
      setTo('');
      setSubject('');
      setBody('');
    } catch {
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleIngest = async () => {
    setIsIngesting(true);
    try {
      const response = await emailsApi.ingestResumes();
      const processed = response.data?.data || [];
      if (processed.length > 0) {
        toast.success(`Successfully ingested ${processed.length} new candidate resume(s)!`);
      } else {
        toast('No new unread resume emails found matching the criteria. Make sure the email is UNREAD, in Primary tab, has a PDF/Docx/Txt attachment, and contains keywords (resume, cv, apply, etc.).', {
          icon: 'ℹ️',
          duration: 8000
        });
      }
    } catch (error: any) {
      console.error('Ingestion error:', error);
      toast.error('Failed to ingest resumes');
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Send Email */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center gap-1 mb-2">
          <Mail size={20} style={{ color: 'var(--accent-light)' }} />
          <h3>Send Email</h3>
        </div>

        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label>To</label>
          <input className="input" type="email" placeholder="recipient@email.com" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label>Subject</label>
          <input className="input" placeholder="Email subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div className="input-group" style={{ marginBottom: '1rem' }}>
          <label>Body</label>
          <textarea className="textarea" placeholder="Email body..." value={body} onChange={(e) => setBody(e.target.value)} />
        </div>

        <button className="btn btn-primary" onClick={handleSend} disabled={isSending}>
          <Mail size={16} /> {isSending ? 'Sending...' : 'Send Email'}
        </button>
      </div>

      {/* Ingest Resumes */}
      <div className="glass-card">
        <div className="flex items-center gap-1 mb-2">
          <Inbox size={20} style={{ color: 'var(--success)' }} />
          <h3>Ingest Resumes from Gmail</h3>
        </div>
        <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
          Automatically fetch and process resume attachments from your connected Gmail inbox.
        </p>
        <button className="btn btn-success" onClick={handleIngest} disabled={isIngesting}>
          <Inbox size={16} /> {isIngesting ? 'Ingesting...' : 'Ingest Resumes'}
        </button>
      </div>
    </div>
  );
}
