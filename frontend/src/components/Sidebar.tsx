import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useSavedJobs } from '../context/SavedJobsContext';
import { initials } from '../lib/format';
import { Icon, type IconName } from './Icon';

interface SidebarProps {
  isMobile: boolean;
  collapsed: boolean;
  open: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function Sidebar({ isMobile, collapsed, open, onClose, onToggleCollapse }: SidebarProps) {
  const { logout, username } = useAuth();
  const { displayName, prefs, jobsUrl } = usePreferences();
  const { savedIds } = useSavedJobs();
  const showLabels = isMobile || !collapsed;

  const nav: { to: string; label: string; icon: IconName; end?: boolean; badge?: number; divider?: boolean }[] = [
    { to: '/', label: 'Dashboard', icon: 'grid', end: true },
    { to: jobsUrl, label: 'Jobs', icon: 'briefcase' },
    { to: '/saved', label: 'Saved Jobs', icon: 'bookmark', badge: savedIds.length || undefined },
    { to: '/sources', label: 'Sources', icon: 'db' },
    { to: '/analytics', label: 'Analytics', icon: 'chart' },
    { to: '/settings', label: 'Settings', icon: 'sliders', divider: true },
  ];

  const classes = ['sidebar', isMobile && 'is-mobile', isMobile && open && 'is-open', !isMobile && collapsed && 'is-collapsed']
    .filter(Boolean)
    .join(' ');

  return (
    <aside aria-label="Primary" className={classes}>
      <div className="sidebar-head">
        <div className="brand-mark"><Icon name="logo" strokeWidth={2} /></div>
        {showLabels && <span className="brand-name">Job Intelligence</span>}
        {isMobile && (
          <button type="button" className="icon-btn-ghost" style={{ width: 32, height: 32 }} onClick={onClose} aria-label="Close navigation">
            <Icon name="x" />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {nav.map((item) => (
          <div key={item.label}>
            {item.divider && <div className="sidebar-divider" />}
            <NavLink to={item.to} end={item.end} title={item.label} className="nav-item" onClick={isMobile ? onClose : undefined}>
              <Icon name={item.icon} size={17} />
              {showLabels && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}
                </>
              )}
            </NavLink>
          </div>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {!isMobile && (
        <div className="sidebar-collapse">
          <button
            type="button"
            className="nav-item"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon name="panel" size={17} />
            {showLabels && <span>Collapse</span>}
          </button>
        </div>
      )}

      <div className="sidebar-user">
        <div className="avatar" aria-hidden="true" style={{ width: 32, height: 32, fontSize: 12 }}>{initials(displayName)}</div>
        {showLabels && (
          <>
            <div className="who">
              <div className="who-name truncate">{displayName}</div>
              <div className="who-role truncate">{prefs.role || `@${username ?? 'user'}`}</div>
            </div>
            <button type="button" className="icon-btn-ghost" onClick={logout} aria-label="Log out" title="Log out">
              <Icon name="logout" />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
