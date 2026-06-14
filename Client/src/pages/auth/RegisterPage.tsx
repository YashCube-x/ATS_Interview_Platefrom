import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import type { UserRole } from '../../types';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('recruiter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await register({ name, email, password, role });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Registration failed. Please try again.';
      toast.error(message);
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
        <h1>Create Account</h1>
        <p className="subtitle">Join the AI-powered ATS Platform</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-group">
              <label htmlFor="register-name">Full Name</label>
              <input
                id="register-name"
                type="text"
                className="input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                className="input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-group">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                className="input"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-group">
              <label htmlFor="register-role">Role</label>
              <select
                id="register-role"
                className="select"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={isSubmitting}
            id="register-submit-btn"
            style={{ marginTop: '0.5rem' }}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="form-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
