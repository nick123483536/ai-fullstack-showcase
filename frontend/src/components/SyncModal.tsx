import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { Icon } from './Icon';

export function SyncModal() {
  const { syncModalOpen, setSyncModalOpen, runSync } = useWorkspace();
  const { isAdmin } = useAuth();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!syncModalOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSyncModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [syncModalOpen, setSyncModalOpen]);

  if (!syncModalOpen || !isAdmin) return null;

  const close = () => setSyncModalOpen(false);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ji-modal-title">
      <div className="modal-backdrop" onClick={close} />
      <div className="modal-panel">
        <div className="modal-body">
          <span className="modal-icon"><Icon name="refresh" size={20} /></span>
          <h2 id="ji-modal-title" className="modal-title">Sync sources now?</h2>
          <p className="modal-text">
            Pulls the latest listings from your connected sources instead of waiting for the next hourly run. It usually takes a few seconds.
          </p>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn" onClick={close}>Cancel</button>
          <button type="button" ref={confirmRef} className="btn btn-primary" onClick={() => void runSync()}>
            <Icon name="refresh" size={16} />
            Sync sources
          </button>
        </div>
      </div>
    </div>
  );
}
