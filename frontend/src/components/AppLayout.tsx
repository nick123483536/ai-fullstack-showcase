import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MOBILE_MAX, useWindowWidth } from '../hooks/useWindowWidth';
import { Sidebar } from './Sidebar';
import { SyncModal } from './SyncModal';
import { Topbar } from './Topbar';

export function AppLayout() {
  const width = useWindowWidth();
  const isMobile = width <= MOBILE_MAX;
  // null = follow the screen width; a boolean = the user's explicit choice.
  const [collapsedChoice, setCollapsedChoice] = useState<boolean | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const collapsed = !isMobile && (collapsedChoice ?? width < 1100);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-shell">
      {isMobile && drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}
      <Sidebar
        isMobile={isMobile}
        collapsed={collapsed}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onToggleCollapse={() => setCollapsedChoice(!collapsed)}
      />
      <div className="app-main">
        <Topbar isMobile={isMobile} onOpenDrawer={() => setDrawerOpen(true)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <SyncModal />
    </div>
  );
}
