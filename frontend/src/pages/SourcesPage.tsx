import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { SyncHistoryTable } from '../components/SyncHistoryTable';
import { Pill, Spinner, StatusBadge } from '../components/ui';
import { useWorkspace } from '../context/WorkspaceContext';
import { formatDateTime } from '../lib/format';

const PIPELINE: { name: string; desc: string; live: boolean }[] = [
  { name: 'Sources', desc: 'External providers', live: true },
  { name: 'Ingestion', desc: 'Fetch on demand', live: true },
  { name: 'Normalization', desc: 'Map to job schema', live: true },
  { name: 'Search & filtering', desc: 'Query and refine', live: true },
  { name: 'Intelligence', desc: 'AI analysis', live: false },
];

const PLANNED = [
  { name: 'LinkedIn', initials: 'LI', desc: 'Professional network job listings.' },
  { name: 'Indeed', initials: 'IN', desc: 'Aggregated listings across industries.' },
  { name: 'Naukri', initials: 'NK', desc: 'India-focused job portal.' },
];

export function SourcesPage() {
  const { jobs, jobsStatus, syncing, syncHistory, lastSync, setSyncModalOpen } = useWorkspace();
  const imported = jobs.filter((j) => j.source === 'INDIAN_API').length;

  const stats: { k: string; v: string; mono?: boolean }[] = [
    { k: 'Last sync', v: lastSync ? formatDateTime(lastSync) : 'Not from this browser' },
    { k: 'Jobs stored', v: jobsStatus === 'loading' && !jobs.length ? '—' : imported.toLocaleString('en-IN') },
    { k: 'Source key', v: 'INDIAN_API', mono: true },
    { k: 'Endpoint', v: 'GET /api/ingestion/source', mono: true },
  ];

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Sources</h1>
        <p className="page-desc">External providers that feed the ingestion pipeline.</p>
      </div>

      <section aria-label="Pipeline" className="pipeline">
        {PIPELINE.map((p, i) => (
          <div key={p.name} className="pipeline-step">
            <div className="pipeline-step-top">
              <span className="pipeline-step-n">{String(i + 1).padStart(2, '0')}</span>
              <Pill tone={p.live ? 'success' : 'muted'} size="xs">{p.live ? 'Live' : 'Planned'}</Pill>
            </div>
            <div className="pipeline-step-name">{p.name}</div>
            <div className="pipeline-step-desc">{p.desc}</div>
          </div>
        ))}
      </section>

      <section aria-labelledby="ji-ia" className="card">
        <div className="source-hero">
          <div className="tile tile-44 is-accent" aria-hidden="true">IA</div>
          <div className="source-hero-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 id="ji-ia" style={{ fontSize: 16, fontWeight: 600 }}>IndianAPI Jobs API</h2>
              <StatusBadge tone="success">Active</StatusBadge>
            </div>
            <p className="muted" style={{ marginTop: 4, fontSize: 13.5 }}>
              Primary source. Listings are fetched on demand and normalized into the job schema.
            </p>
          </div>
          <div className="actions">
            <Link to="/jobs?source=INDIAN_API" className="btn">View jobs</Link>
            <button type="button" className="btn btn-primary" disabled={syncing} onClick={() => setSyncModalOpen(true)}>
              {syncing ? <Spinner /> : <Icon name="refresh" size={15} />}
              {syncing ? 'Syncing…' : 'Run sync'}
            </button>
          </div>
        </div>
        <dl className="stat-grid">
          {stats.map((s) => (
            <div key={s.k}>
              <dt>{s.k}</dt>
              <dd className={s.mono ? 'mono' : undefined} title={s.v}>{s.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <SyncHistoryTable title="Recent syncs" history={syncHistory} secondColumn="trigger" />

      <section aria-labelledby="ji-planned" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 id="ji-planned" className="card-title">Planned sources</h2>
        <div className="planned-grid">
          {PLANNED.map((p) => (
            <div key={p.name} className="card planned-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="tile tile-32 is-faint" aria-hidden="true">{p.initials}</div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                <Pill>Coming soon</Pill>
              </div>
              <p className="muted" style={{ fontSize: 13 }}>{p.desc}</p>
              <button type="button" className="btn btn-ghost-disabled" disabled>Not available yet</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
