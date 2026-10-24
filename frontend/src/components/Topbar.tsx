import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { formatClock, minutesSince, relativeTime } from '../lib/format';
import { Icon } from './Icon';

const TITLES: [RegExp, string][] = [
  [/^\/$/, 'Today'],
  [/^\/jobs\/[^/]+/, 'Job'],
  [/^\/jobs/, 'All jobs'],
  [/^\/saved/, 'Saved'],
  [/^\/sources/, 'Sources'],
  [/^\/analytics/, 'Analytics'],
  [/^\/settings/, 'Settings'],
];

interface TopbarProps {
  folded: boolean;
  onToggleSidebar: () => void;
  onSearch: () => void;
}

export function Topbar({ folded, onToggleSidebar, onSearch }: TopbarProps) {
  const { pathname } = useLocation();
  const { isDark, setTheme } = useTheme();
  const { syncing, lastSync } = useWorkspace();
  const title = TITLES.find(([re]) => re.test(pathname))?.[1] ?? '';
  const themeLabel = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  const status = syncing ? 'Syncing sources…'
    : lastSync ? `Synced ${relativeTime(minutesSince(lastSync))}`
      : 'Auto-sync every hour';

  return (
    <header className="topbar">
      <button type="button" className="icon-btn" onClick={onToggleSidebar} aria-label={folded ? 'Open navigation' : 'Collapse sidebar'}>
        <Icon name={folded ? 'menu' : 'panel'} size={18} />
      </button>
      <span className="vsep" />
      <div className="crumbs">
        <span>Workspace</span>
        <Icon name="chevRight" size={14} />
        <b>{title}</b>
      </div>
      <button type="button" className="cmdk-btn" onClick={onSearch}>
        <Icon name="search" size={16} />
        <span className="truncate">Search roles, companies, commands</span>
        <kbd>Ctrl K</kbd>
      </button>
      <span className="live-chip" title={lastSync ? `Last sync from this browser at ${formatClock(lastSync)}` : undefined}>
        {syncing ? <span className="spinner" style={{ width: 10, height: 10 }} /> : <span className="ping" />}
        {status}
      </span>
      <button type="button" className="icon-btn" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label={themeLabel} title={themeLabel}>
        <Icon name={isDark ? 'sun' : 'moon'} size={18} />
      </button>
    </header>
  );
}
