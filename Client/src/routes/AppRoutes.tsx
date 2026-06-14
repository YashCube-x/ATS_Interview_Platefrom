import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Dashboard
import DashboardPage from '../pages/dashboard/DashboardPage';

// Candidates
import CandidatesPage from '../pages/candidates/CandidatesPage';
import CandidateDetailPage from '../pages/candidates/CandidateDetailPage';

// Jobs
import JobsPage from '../pages/jobs/JobsPage';
import JobDetailPage from '../pages/jobs/JobDetailPage';

// Resume
import ResumeUploadPage from '../pages/resumes/ResumeUploadPage';

// Matching
import MatchingResultsPage from '../pages/matching/MatchingResultsPage';

// Interviews
import InterviewsPage from '../pages/interviews/InterviewsPage';

// Analytics
import AnalyticsPage from '../pages/analytics/AnalyticsPage';

// Emails
import EmailsPage from '../pages/emails/EmailsPage';

// Web Applications (from main website)
import WebApplicationsPage from '../pages/webApplications/WebApplicationsPage';

// Portal
import PortalLoginPage from '../pages/portal/PortalLoginPage';
import PortalDashboard from '../pages/portal/PortalDashboard';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Candidate Portal (separate layout) */}
      <Route path="/portal" element={<PortalLoginPage />} />
      <Route path="/portal/dashboard" element={<PortalDashboard />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="candidates" element={<CandidatesPage />} />
        <Route path="candidates/:id" element={<CandidateDetailPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
        <Route path="resumes/upload" element={<ResumeUploadPage />} />
        <Route path="matching" element={<MatchingResultsPage />} />
        <Route path="matching/:jobId" element={<MatchingResultsPage />} />
        <Route path="interviews" element={<InterviewsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="emails" element={<EmailsPage />} />
        <Route path="web-applications" element={<WebApplicationsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
