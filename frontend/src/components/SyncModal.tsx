import { useEffect, useRef } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Icon } from './Icon';

export function SyncModal() {
  const { syncModalOpen, setSyncModalOpen, runSync } = useWorkspace();
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

  if (!syncModalOpen) return null;

  const close = () => setSyncModalOpen(false);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="ji-modal-title">
      <div className="modal-backdrop" onClick={close} />
      <div className="modal-panel">
        <div className="modal-body">
          <div className="modal-icon"><Icon name="refresh" size={17} /></div>
          <div>
            <h2 id="ji-modal-title" className="modal-title">Run ingestion?</h2>
            <p className="modal-text">
              Fetches the latest listings from IndianAPI through the ingestion service. This usually takes a few seconds.
            </p>
          </div>
          <code className="modal-code">GET /api/ingestion/source</code>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-md" onClick={close}>Cancel</button>
          <button type="button" ref={confirmRef} className="btn btn-md btn-primary" onClick={() => void runSync()}>
            Run ingestion
          </button>
        </div>
      </div>
    </div>
  );
}
