import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SHELL_FOLD_MAX, useWindowWidth } from '../hooks/useWindowWidth';
import { readJson, writeJson } from '../lib/storage';
import { CommandPalette } from './CommandPalette';
import { AppFooter } from './AppFooter';
import { Sidebar } from './Sidebar';
import { SyncModal } from './SyncModal';
import { Topbar } from './Topbar';

const MIN_KEY = 'ji.sidebarMin';

export function AppLayout() {
  const folded = useWindowWidth() <= SHELL_FOLD_MAX;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [min, setMin] = useState(() => readJson<boolean>(MIN_KEY, false));
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setSheetOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!folded) setSheetOpen(false);
  }, [folded]);

  // Ctrl+K (or Cmd+K) opens the command palette from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (folded) {
      setSheetOpen((o) => !o);
      return;
    }
    setMin((m) => {
      writeJson(MIN_KEY, !m);
      return !m;
    });
  }, [folded]);

  const openPalette = useCallback(() => setPaletteOpen(true), []);

  return (
    <div className="app-shell">
      {folded && sheetOpen && <div className="sheet-scrim" onClick={() => setSheetOpen(false)} />}
      {(!folded || sheetOpen) && (
        <Sidebar sheet={folded} min={!folded && min} onClose={() => setSheetOpen(false)} onSearch={openPalette} />
      )}
      <div className="app-main">
        <Topbar folded={folded} onToggleSidebar={toggleSidebar} onSearch={openPalette} />
        <main className="app-content">
          <Outlet />
        </main>
        <AppFooter onShortcuts={openPalette} />
      </div>
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      <SyncModal />
    </div>
  );
}
