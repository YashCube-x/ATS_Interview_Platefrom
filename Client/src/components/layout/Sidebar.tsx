import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileUp,
  Target,
  Calendar,
  BarChart3,
  LogOut,
  Mail,
  ChevronLeft,
  X,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

const mainNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/candidates', icon: Users, label: 'Candidates' },
  { to: '/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/resumes/upload', icon: FileUp, label: 'Upload Resume' },
  { to: '/interviews', icon: Calendar, label: 'Interviews' },
];

const insightsNavItems = [
  { to: '/matching', icon: Target, label: 'Matching' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/emails', icon: Mail, label: 'Emails' },
  { to: '/web-applications', icon: Globe, label: 'Website Apps' },
];

export default function Sidebar({
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside className={`sidebar${isCollapsed ? ' collapsed' : ''}${isMobileOpen ? ' open' : ''}`} id="sidebar-nav">
      {/* Brand */}
      <div className="sidebar-brand" style={{ justifyContent: 'space-between', width: '100%' }}>
        <div className="flex items-center gap-1">
          <div className="sidebar-brand-icon">
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
          {!isCollapsed && (
            <div className="sidebar-brand-text-wrapper" style={{ marginLeft: '6px' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, background: 'none', WebkitTextFillColor: 'initial', letterSpacing: '0.05em' }}>
                ASHTA TECH
              </h2>
              <div style={{ fontSize: '0.5625rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.08em', marginTop: '-2px' }}>
                AUTOMATION
              </div>
            </div>
          )}
        </div>

        {/* Action Toggle Buttons */}
        {!isCollapsed && !isMobileOpen && (
          <button
            className="btn btn-ghost btn-icon"
            onClick={onToggleCollapse}
            style={{ padding: '4px', display: 'inline-flex' }}
            title="Collapse Sidebar"
            id="sidebar-collapse-btn"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {isMobileOpen && (
          <button
            className="btn btn-ghost btn-icon"
            onClick={onCloseMobile}
            style={{ padding: '4px', display: 'inline-flex' }}
            title="Close Menu"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <span className="sidebar-section-label">Main</span>
        {mainNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            title={isCollapsed ? item.label : undefined}
            onClick={isMobileOpen ? onCloseMobile : undefined}
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}

        <span className="sidebar-section-label" style={{ marginTop: '0.5rem' }}>
          Insights
        </span>
        {insightsNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            title={isCollapsed ? item.label : undefined}
            onClick={isMobileOpen ? onCloseMobile : undefined}
          >
            <item.icon />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
          <div className="user-avatar" style={{ flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                {user?.name || 'Sanjay Deshpande'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {user?.role?.toUpperCase() || 'ADMIN'}
              </div>
            </div>
          )}
        </div>
        <button className="btn btn-ghost btn-sm w-full" onClick={logout} id="logout-btn" title="Sign Out">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
