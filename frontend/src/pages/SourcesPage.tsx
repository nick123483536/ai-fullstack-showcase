import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { SyncHistoryTable } from '../components/SyncHistoryTable';
import { PostedTime } from '../components/JobCard';
import { LogoTile, Pill, Spinner } from '../components/ui';
import { useWorkspace } from '../context/WorkspaceContext';
import { city, formatClock, formatCount, jobPosted, sortByPostedDesc, sourceLabel } from '../lib/format';

/** What the backend's ingestion service runs, and when (JobIngestionService's schedules). */
const CONNECTED: { key: string; schedule: string }[] = [
  { key: 'ADZUNA', schedule: 'Every hour' },
  { key: 'JOBICY', schedule: '00:00, 06:00, 12:00, 18:00' },
  { key: 'REMOTIVE', schedule: '00:00, 06:00, 12:00, 18:00' },
];

const PLANNED: [string, string][] = [
  ['LinkedIn', 'Professional network listings'],
  ['Indeed', 'Listings across industries'],
  ['Naukri', 'India-focused job portal'],
];

export function SourcesPage() {
  const { jobs, jobsStatus, syncing, syncHistory, lastSync, setSyncModalOpen } = useWorkspace();
  const loading = jobsStatus === 'loading' && jobs.length === 0;
  const keys = [...new Set([...CONNECTED.map((c) => c.key), ...jobs.map((j) => j.source)])];
  const rows = keys.map((key) => {
    const own = sortByPostedDesc(jobs.filter((j) => j.source === key));
    const connected = CONNECTED.find((c) => c.key === key);
    return { key, connected: !!connected, schedule: connected?.schedule ?? 'No longer fetched', count: own.length, newest: own[0], latest: own.slice(0, 3) };
  });
  const delivering = rows.filter((r) => r.connected && r.count > 0).length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Sources</h1>
          <p className="page-desc">
            {loading ? 'Loading sources…' : `${delivering} of ${CONNECTED.length} connected sources have delivered roles, ${formatCount(jobs.length)} stored in all.`}
          </p>
        </div>
      </div>

      <div className="src-grid">
        <div className="src-col">
          <section aria-labelledby="ji-conn" className="panel panel-clip">
            <div className="panel-head">
              <div>
                <h2 id="ji-conn" className="panel-title">Connected</h2>
                <div className="panel-sub">Fetched by the ingestion service on a schedule</div>
              </div>
            </div>
            <div className="table-scroll">
              <table className="dtable src-table">
                <thead>
                  <tr>
                    <th scope="col">Source</th>
                    <th scope="col" className="col-hide-sm">Schedule</th>
                    <th scope="col" className="num">Roles</th>
                    <th scope="col" className="num col-hide-sm">Newest</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key}>
                      <td>
                        <Link to={`/jobs?source=${r.key}`} className="src-name">{sourceLabel(r.key)}</Link>
                        <div className="src-key">{r.key}</div>
                      </td>
                      <td className="muted col-hide-sm">{r.schedule}</td>
                      <td className="num">{loading ? '—' : formatCount(r.count)}</td>
                      <td className="num muted col-hide-sm">{r.newest ? jobPosted(r.newest) : '—'}</td>
                      <td>{!r.connected ? <Pill>Retired</Pill> : r.count > 0 ? <Pill tone="positive"><span className="ping" />Delivering</Pill> : <Pill tone="warning">No roles yet</Pill>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="ji-latest" className="panel">
            <div className="panel-head">
              <div>
                <h2 id="ji-latest" className="panel-title">Latest from each source</h2>
                <div className="panel-sub">The three newest roles each one delivered</div>
              </div>
            </div>
            <div className="latest-grid">
              {rows.map((r) => (
                <div key={r.key}>
                  <h3>{sourceLabel(r.key)}</h3>
                  {r.latest.length === 0 ? <p className="muted">Nothing delivered yet.</p> : (
                    <ul className="mini-list">
                      {r.latest.map((j) => (
                        <li key={j.id}>
                          <Link to={`/jobs/${j.id}`}>
                            <LogoTile name={j.company} size={32} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span className="mini-title truncate">{j.title}</span>
                              <div className="mini-sub"><span className="truncate">{j.company} · {city(j.location)}</span><PostedTime job={j} /></div>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          <SyncHistoryTable history={syncHistory} />
        </div>

        <div className="src-col">
          <section aria-labelledby="ji-sync" className="panel">
            <div className="panel-head">
              <div>
                <h2 id="ji-sync" className="panel-title">Sync now</h2>
                <div className="panel-sub">{lastSync ? `Last run from this browser at ${formatClock(lastSync)}` : 'Not run from this browser yet'}</div>
              </div>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p className="muted">Pulls the latest listings from every connected source instead of waiting for the next scheduled run. Needs an admin account.</p>
              <button type="button" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={syncing} onClick={() => setSyncModalOpen(true)}>
                {syncing ? <Spinner /> : <Icon name="refresh" size={15} />}
                {syncing ? 'Syncing…' : 'Sync sources'}
              </button>
            </div>
          </section>

          <section aria-labelledby="ji-planned" className="panel">
            <div className="panel-head">
              <h2 id="ji-planned" className="panel-title">Planned</h2>
            </div>
            <div className="panel-body">
              <ul className="planned-sources">
                {PLANNED.map(([name, desc]) => <li key={name}><span>{name}</span><span>{desc}</span></li>)}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
