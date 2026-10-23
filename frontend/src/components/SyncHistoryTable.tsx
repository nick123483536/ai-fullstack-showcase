import type { SyncRecord } from '../context/WorkspaceContext';
import { formatDateTime, formatDuration } from '../lib/format';
import { StatusBadge } from './ui';

interface SyncHistoryTableProps {
  title: string;
  history: SyncRecord[];
  /** Second column: "Trigger" on Sources, "Source" on Analytics. */
  secondColumn: 'trigger' | 'source';
}

export function SyncHistoryTable({ title, history, secondColumn }: SyncHistoryTableProps) {
  const id = `ji-hist-${secondColumn}`;
  return (
    <section aria-labelledby={id} className="card card-clip">
      <div style={{ padding: '14px 20px' }}>
        <h2 id={id} className="card-title">{title}</h2>
        <div className="card-sub">Runs started from this browser</div>
      </div>
      {history.length === 0 ? (
        <div className="inline-empty" style={{ padding: '16px 20px' }}>No ingestion runs yet.</div>
      ) : (
        <div className="table-scroll">
          <div className="table" role="table">
            <div className="table-row is-head" role="row">
              <span role="columnheader">Started</span>
              <span role="columnheader">{secondColumn === 'trigger' ? 'Trigger' : 'Source'}</span>
              <span role="columnheader">Fetched</span>
              <span role="columnheader">Duration</span>
              <span role="columnheader">Status</span>
            </div>
            {history.map((h) => (
              <div key={h.at} className="table-row" role="row">
                <span role="cell">{formatDateTime(h.at)}</span>
                {secondColumn === 'trigger'
                  ? <span role="cell" className="muted">Manual</span>
                  : <span role="cell" className="mono muted" style={{ fontSize: 11.5 }}>INDIAN_API</span>}
                <span role="cell" className="tabular">{h.ok ? h.fetched : '—'}</span>
                <span role="cell" className="tabular muted">{formatDuration(h.durationMs)}</span>
                <span role="cell">
                  <StatusBadge tone={h.ok ? 'success' : 'danger'}>{h.ok ? 'Success' : 'Failed'}</StatusBadge>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
