import { Bell, Menu, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  title: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onToggleMobileMenu: () => void;
}

export default function Header({
  title,
  isCollapsed,
  onToggleCollapse,
  onToggleMobileMenu,
}: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="header" id="page-header">
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Mobile Hamburger menu */}
        <button
          className="btn btn-icon btn-ghost mobile-only"
          onClick={onToggleMobileMenu}
          title="Open Navigation"
          id="mobile-menu-btn"
          style={{ padding: '6px' }}
        >
          <Menu size={18} />
        </button>

        {/* Desktop Sidebar expand icon when collapsed */}
        {isCollapsed && (
          <button
            className="btn btn-icon btn-ghost desktop-only"
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            id="sidebar-expand-btn"
            style={{ padding: '6px' }}
          >
            <ChevronRight size={18} />
          </button>
        )}

        <h1 style={{ margin: 0 }}>{title}</h1>
      </div>
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="btn btn-icon btn-ghost" id="notifications-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="user-avatar" title={user?.name || 'User'}>
          {user?.name?.charAt(0).toUpperCase() || 'S'}
        </div>
      </div>
    </header>
  );
}
