import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { portalApi } from '../../api/portal.api';
import toast from 'react-hot-toast';

export default function PortalLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await portalApi.login(email, password);
      localStorage.setItem('portalToken', (data.data as { token: string }).token);
      toast.success('Welcome to your portal!');
      navigate('/portal/dashboard');
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <div
            className="sidebar-brand-icon"
            style={{ margin: '0 auto 1rem', width: 48, height: 48 }}
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
        </div>
        <h1>Candidate Portal</h1>
        <p className="subtitle">Check your application status and interview schedule</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-group">
              <label htmlFor="portal-email">Email</label>
              <input
                id="portal-email"
                type="email"
                className="input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-group">
              <label htmlFor="portal-password">Password</label>
              <input
                id="portal-password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-lg w-full"
            style={{ background: 'linear-gradient(135deg, #00d68f, #4fc3f7)', color: '#0a0a0f', fontWeight: 600, marginTop: '0.5rem' }}
            disabled={isSubmitting}
            id="portal-login-btn"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="form-footer">
          <a href="/login">← Back to recruiter login</a>
        </div>
      </div>
    </div>
  );
}
