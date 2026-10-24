import type { SyncRecord } from '../context/WorkspaceContext';
import { formatDuration, formatIso } from '../lib/format';
import { Pill } from './ui';

export function SyncHistoryTable({ history }: { history: SyncRecord[] }) {
  return (
    <section aria-labelledby="ji-hist" className="panel panel-clip">
      <div className="panel-head">
        <div>
          <h2 id="ji-hist" className="panel-title">Recent syncs</h2>
          <div className="panel-sub">Runs started from this browser; scheduled runs happen on the server</div>
        </div>
      </div>
      {history.length === 0 ? (
        <p className="empty-line">No syncs run from this browser yet.</p>
      ) : (
        <div className="table-scroll">
          <table className="dtable">
            <thead>
              <tr>
                <th scope="col">Started</th>
                <th scope="col" className="num">Fetched</th>
                <th scope="col" className="num">Duration</th>
                <th scope="col">Result</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.at}>
                  <td className="num">{formatIso(h.at)}</td>
                  <td className="num">{h.ok ? h.fetched : '—'}</td>
                  <td className="num muted">{formatDuration(h.durationMs)}</td>
                  <td>{h.ok ? <Pill tone="positive">Completed</Pill> : <Pill tone="negative">Failed</Pill>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
