import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/candidates': 'Candidates',
  '/jobs': 'Jobs',
  '/resumes/upload': 'Upload Resume',
  '/interviews': 'Interviews',
  '/matching': 'AI Matching',
  '/analytics': 'Analytics',
  '/emails': 'Emails',
};

export default function DashboardLayout() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getTitle = () => {
    const exactMatch = pageTitles[location.pathname];
    if (exactMatch) return exactMatch;
    // Check prefix matches for dynamic routes
    if (location.pathname.startsWith('/candidates/')) return 'Candidate Details';
    if (location.pathname.startsWith('/jobs/')) return 'Job Details';
    if (location.pathname.startsWith('/matching/')) return 'Matching Results';
    return 'ATS Platform';
  };

  return (
    <div className="dashboard-layout">
      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 99,
          }}
        />
      )}
      <Sidebar
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        onCloseMobile={() => setIsMobileOpen(false)}
      />
      <main className={`main-content${isCollapsed ? ' sidebar-collapsed' : ''}`}>
        <Header
          title={getTitle()}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onToggleMobileMenu={() => setIsMobileOpen(true)}
        />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
