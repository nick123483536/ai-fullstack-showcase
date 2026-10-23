import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Icon } from './Icon';

const TITLES: [RegExp, string][] = [
  [/^\/$/, 'Dashboard'],
  [/^\/jobs\/[^/]+/, 'Job details'],
  [/^\/jobs/, 'Jobs'],
  [/^\/saved/, 'Saved Jobs'],
  [/^\/sources/, 'Sources'],
  [/^\/analytics/, 'Analytics'],
  [/^\/settings/, 'Settings'],
];

export function Topbar({ isMobile, onOpenDrawer }: { isMobile: boolean; onOpenDrawer: () => void }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isDark, setTheme } = useTheme();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const title = TITLES.find(([re]) => re.test(pathname))?.[1] ?? '';
  const themeLabel = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/jobs?title=${encodeURIComponent(q)}` : '/jobs');
    setQuery('');
  };

  return (
    <header className="topbar">
      {isMobile && (
        <button type="button" className="icon-btn" onClick={onOpenDrawer} aria-label="Open navigation">
          <Icon name="menu" />
        </button>
      )}
      <div className="crumbs">
        <span className="crumb-root">Workspace</span>
        <span className="crumb-sep">/</span>
        <span className="crumb-current">{title}</span>
      </div>
      <div className="topbar-spacer" />
      <form role="search" className="topbar-search" onSubmit={onSearch}>
        <Icon name="search" size={15} />
        <input aria-label="Quick search jobs" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search jobs…" />
      </form>
      <button type="button" className="icon-btn" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label={themeLabel} title={themeLabel}>
        <Icon name={isDark ? 'sun' : 'moon'} />
      </button>
      <button type="button" className="icon-btn" onClick={() => toast('Notification delivery is coming soon')} aria-label="Notifications">
        <Icon name="bell" />
      </button>
    </header>
  );
}
