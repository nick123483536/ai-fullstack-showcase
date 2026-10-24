import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { useTheme } from '../context/ThemeContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { city, jobPosted, sortByPostedDesc } from '../lib/format';
import { Icon, type IconName } from './Icon';
import { LogoTile } from './ui';

interface Item {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon?: IconName;
  lead?: ReactNode;
  kbd?: string;
  run: () => void;
}

/** Ctrl+K: jump to a screen, open a role, or run an action, all from the keyboard. */
export function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  const { jobsUrl } = usePreferences();
  const { isDark, setTheme } = useTheme();
  const { jobs, setSyncModalOpen } = useWorkspace();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => previous?.focus();
  }, []);

  const items = useMemo<Item[]>(() => {
    const go = (to: string) => () => navigate(to);
    const q = query.trim().toLowerCase();
    const pages: Item[] = [
      { id: 'p-today', group: 'Jump to', label: 'Today', icon: 'inbox', run: go('/') },
      { id: 'p-jobs', group: 'Jump to', label: 'All jobs', icon: 'briefcase', run: go(jobsUrl) },
      { id: 'p-saved', group: 'Jump to', label: 'Saved', icon: 'bookmark', run: go('/saved') },
      { id: 'p-analytics', group: 'Jump to', label: 'Analytics', icon: 'chart', run: go('/analytics') },
      { id: 'p-settings', group: 'Jump to', label: 'Settings', icon: 'settings', run: go('/settings') },
    ];
    const actions: Item[] = [
      { id: 'a-fresh', group: 'Actions', label: 'Show roles from the last 24 hours', icon: 'clock', run: go('/jobs?postedWithin=24h') },
      { id: 'a-theme', group: 'Actions', label: isDark ? 'Switch to light theme' : 'Switch to dark theme', icon: isDark ? 'sun' : 'moon', run: () => setTheme(isDark ? 'light' : 'dark') },
      { id: 'a-out', group: 'Actions', label: 'Sign out', icon: 'logout', run: logout },
    ];
    const matching = q
      ? jobs.filter((j) => `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(q)).slice(0, 6)
      : sortByPostedDesc(jobs).slice(0, 4);
    const roles: Item[] = matching.map((j) => ({
      id: `j-${j.id}`,
      group: q ? 'Roles' : 'Newest roles',
      label: j.title,
      hint: `${j.company} · ${city(j.location)} · ${jobPosted(j)}`,
      lead: <LogoTile name={j.company} size={26} />,
      run: go(`/jobs/${j.id}`),
    }));
    if (isAdmin) {
      pages.splice(3, 0, { id: 'p-sources', group: 'Jump to', label: 'Sources', icon: 'db', run: go('/sources') });
      actions.unshift({ id: 'a-sync', group: 'Actions', label: 'Sync sources now', icon: 'refresh', run: () => setSyncModalOpen(true) });
    }
    const filter = (list: Item[]) => (q ? list.filter((i) => i.label.toLowerCase().includes(q)) : list);
    const searchAll: Item[] = q ? [{ id: 's-all', group: 'Search', label: `Search all jobs for “${query.trim()}”`, icon: 'search', run: go(`/jobs?title=${encodeURIComponent(query.trim())}`) }] : [];
    return [...searchAll, ...roles, ...filter(pages), ...filter(actions)];
  }, [query, jobs, jobsUrl, isDark, isAdmin, navigate, setTheme, setSyncModalOpen, logout]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const run = (item: Item | undefined) => {
    if (!item) return;
    onClose();
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(items[active]);
    }
  };

  let lastGroup = '';
  return (
    <div className="palette-scrim" onMouseDown={onClose}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Command palette" onMouseDown={(e) => e.stopPropagation()}>
        <div className="palette-input">
          <Icon name="search" size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search roles, or type a command…"
            aria-label="Search roles or commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="ji-palette-list"
            aria-activedescendant={items[active] ? `ji-cmd-${items[active].id}` : undefined}
          />
          <kbd>Esc</kbd>
        </div>
        <div className="palette-list" id="ji-palette-list" role="listbox" ref={listRef}>
          {items.length === 0 && <div className="palette-empty">Nothing matches “{query}”.</div>}
          {items.map((item, i) => {
            const header = item.group !== lastGroup ? <div className="palette-group">{item.group}</div> : null;
            lastGroup = item.group;
            return (
              <div key={item.id}>
                {header}
                <button
                  type="button"
                  id={`ji-cmd-${item.id}`}
                  role="option"
                  aria-selected={i === active}
                  data-index={i}
                  className={`palette-item${i === active ? ' is-active' : ''}`}
                  onMouseMove={() => setActive(i)}
                  onClick={() => run(item)}
                >
                  {item.lead ?? (item.icon && <Icon name={item.icon} size={17} style={{ color: 'var(--muted)' }} />)}
                  <span style={{ minWidth: 0 }}>
                    <span className="truncate" style={{ display: 'block' }}>{item.label}</span>
                    {item.hint && <span className="muted truncate" style={{ display: 'block' }}>{item.hint}</span>}
                  </span>
                  {i === active && <kbd>Enter</kbd>}
                </button>
              </div>
            );
          })}
        </div>
        <div className="palette-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> move</span>
          <span><kbd>Enter</kbd> open</span>
          <span><kbd>Esc</kbd> close</span>
          <span style={{ marginLeft: 'auto' }}><kbd>Ctrl K</kbd> anywhere</span>
        </div>
      </div>
    </div>
  );
}
