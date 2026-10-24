import { useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useReviewed } from '../context/ReviewedContext';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { city, countBy, formatCount, isFreshJob } from '../lib/format';
import { Icon, type IconName } from './Icon';
import { Brand } from './ui';

interface NavEntry {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
  badge?: string;
  badgeTone?: 'brand' | 'muted';
}

interface SidebarProps {
  sheet: boolean;
  min: boolean;
  onClose: () => void;
  onSearch: () => void;
}

export function Sidebar({ sheet, min, onClose, onSearch }: SidebarProps) {
  const { logout, username, isAdmin } = useAuth();
  const { displayName, prefs, jobsUrl } = usePreferences();
  const { savedIds } = useSavedJobs();
  const { isReviewed } = useReviewed();
  const { jobs } = useWorkspace();
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sheet, onClose]);

  const fresh = jobs.filter(isFreshJob);
  const unseen = fresh.filter((j) => !isReviewed(j.id)).length;
  const reviewedFresh = fresh.length - unseen;
  const goalPct = fresh.length ? Math.round((reviewedFresh / fresh.length) * 100) : 0;

  const discover: NavEntry[] = [
    { to: '/', label: 'Today', icon: 'inbox', end: true, badge: unseen ? `${unseen} new` : undefined, badgeTone: 'brand' },
    { to: jobsUrl, label: 'All jobs', icon: 'briefcase', badge: jobs.length ? formatCount(jobs.length) : undefined, badgeTone: 'muted' },
    { to: '/saved', label: 'Saved', icon: 'bookmark', badge: savedIds.length ? String(savedIds.length) : undefined, badgeTone: 'muted' },
  ];
  const pipeline: NavEntry[] = [
    ...(isAdmin ? [{ to: '/sources', label: 'Sources', icon: 'db' } as NavEntry] : []),
    { to: '/analytics', label: 'Analytics', icon: 'chart' },
  ];

  // Quick filters built from the stored jobs: the last day, remote roles, and the busiest city.
  const quick = useMemo(() => {
    const topCity = countBy(jobs.filter((j) => !/remote|worldwide/i.test(j.location)), (j) => city(j.location))[0];
    const remote = jobs.filter((j) => /remote/i.test(j.location)).length;
    const list: { to: string; label: string; count: number; color: string }[] = [
      { to: '/jobs?postedWithin=24h', label: 'Last 24 hours', count: fresh.length, color: '#10b981' },
    ];
    if (remote) list.push({ to: '/jobs?location=Remote', label: 'Remote', count: remote, color: '#3b82f6' });
    if (topCity) list.push({ to: `/jobs?location=${encodeURIComponent(topCity[0])}`, label: topCity[0], count: topCity[1], color: '#f59e0b' });
    return list;
  }, [jobs, fresh.length]);

  const here = pathname + search;
  const classes = ['sidebar', min && 'is-min', sheet && 'is-sheet'].filter(Boolean).join(' ');

  const item = (n: NavEntry) => (
    <NavLink key={n.label} to={n.to} end={n.end} className="nav-item" onClick={onClose} title={min ? n.label : undefined}>
      <Icon name={n.icon} size={18} />
      <span className="nav-label fade">{n.label}</span>
      {n.badge && <span className={`nav-badge fade is-${n.badgeTone}`}>{n.badge}</span>}
    </NavLink>
  );

  return (
    <aside aria-label="Primary" className={classes}>
      <div className="sidebar-head">
        <Brand scope={`${displayName}'s job radar`} />
        {sheet && (
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close navigation">
            <Icon name="x" size={18} />
          </button>
        )}
      </div>

      <button type="button" className="side-search" onClick={() => { onClose(); onSearch(); }} title={min ? 'Search (Ctrl K)' : undefined}>
        <Icon name="search" size={16} />
        <span className="fade">Search</span>
        <kbd className="fade">Ctrl K</kbd>
      </button>

      <nav aria-label="Main" style={{ display: 'contents' }}>
        <div className="nav-section fade">Discover</div>
        {discover.map(item)}
        <div className="nav-section fade">{isAdmin ? 'Pipeline' : 'Insights'}</div>
        {pipeline.map(item)}
      </nav>

      {quick.length > 0 && (
        <>
          <div className="nav-section fade">Quick filters</div>
          {quick.map((q) => (
            <NavLink key={q.label} to={q.to} onClick={onClose} title={min ? q.label : undefined} className={() => `nav-item${here === q.to ? ' active' : ''}`}>
              <span className="nav-dot" style={{ background: q.color }} />
              <span className="nav-label fade">{q.label}</span>
              <span className="nav-badge fade is-muted">{q.count}</span>
            </NavLink>
          ))}
        </>
      )}

      <div className="sidebar-spacer" />

      {fresh.length > 0 && (
        <div className="goal-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b>Today's review</b>
            <span className="num muted" style={{ fontSize: 12, fontWeight: 700 }}>{reviewedFresh} / {fresh.length}</span>
          </div>
          <div className="goal-track"><div className="goal-fill" style={{ width: `${goalPct}%` }} /></div>
          <span className="muted" style={{ fontSize: 12 }}>
            {unseen ? `Open the ${unseen} role${unseen === 1 ? '' : 's'} you haven't seen yet.` : 'You have seen every new role. Nice.'}
          </span>
        </div>
      )}

      {item({ to: '/settings', label: 'Settings', icon: 'settings' })}

      <div className="sidebar-user">
        <div className="avatar" aria-hidden="true">{(displayName[0] ?? '?').toUpperCase()}</div>
        <div className="who fade">
          <div className="who-name truncate">
            {displayName}
            {isAdmin && <span className="role-badge">Admin</span>}
          </div>
          <div className="who-role truncate">{prefs.role || `@${username ?? 'user'}`}</div>
        </div>
        <button type="button" className="icon-btn sm fade" onClick={logout} aria-label="Sign out" title="Sign out">
          <Icon name="logout" size={16} />
        </button>
      </div>
    </aside>
  );
}
