import type { Job } from '../api/types';
import { Icon } from '../components/Icon';
import { SyncHistoryTable } from '../components/SyncHistoryTable';
import { ErrorState } from '../components/ui';
import { useWorkspace } from '../context/WorkspaceContext';
import { city, countBy, postedTime } from '../lib/format';

const DAYS = 14;
const W = 640;
const H = 200;

function startOfDay(t: number) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Jobs per posting day over the last 14 days, oldest first. */
function dailySeries(jobs: Job[]) {
  const today = startOfDay(Date.now());
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (DAYS - 1 - i));
    return d.getTime();
  });
  const counts = new Array(DAYS).fill(0) as number[];
  jobs.forEach((j) => {
    const t = postedTime(j);
    if (t === null) return;
    const idx = days.indexOf(startOfDay(t));
    if (idx >= 0) counts[idx] += 1;
  });
  return { days, counts };
}

/** Round up to a tick-friendly maximum so the y-axis reads cleanly in 4 steps. */
function niceMax(v: number) {
  if (v <= 4) return 4;
  const step = Math.pow(10, Math.floor(Math.log10(v / 4)));
  const nice = [1, 2, 2.5, 5, 10].map((m) => m * step * 4).find((m) => m >= v);
  return nice ?? Math.ceil(v / 4) * 4;
}

function BarCard({ title, sub, rows }: { title: string; sub: string; rows: [string, number][] }) {
  const max = rows[0]?.[1] || 1;
  return (
    <section className="card bar-card">
      <div style={{ minWidth: 0 }}>
        <h2 className="card-title">{title}</h2>
        <div className="card-sub">{sub}</div>
      </div>
      <div className="bar-rows">
        {rows.length === 0 && <div className="card-sub">No data yet.</div>}
        {rows.map(([label, count]) => (
          <div key={label} className="bar-row">
            <span className="bar-row-label" title={label}>{label}</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max(3, (count / max) * 100)}%` }} /></div>
            <span className="bar-value">{count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AnalyticsPage() {
  const { jobs, jobsStatus, jobsError, reloadJobs, syncHistory } = useWorkspace();

  if (jobsStatus === 'error') {
    return (
      <div className="page">
        <h1 className="page-title">Analytics</h1>
        <ErrorState title="Unable to load analytics." message={jobsError} onRetry={reloadJobs} />
      </div>
    );
  }

  const { days, counts } = dailySeries(jobs);
  const yMax = niceMax(Math.max(...counts));
  const yTicks = [4, 3, 2, 1, 0].map((i) => Math.round((yMax / 4) * i));
  const pts = counts.map((v, i) => [(i * W) / (DAYS - 1), H - (v / yMax) * H]);
  const line = 'M' + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L');
  const area = `${line} L${W},${H} L0,${H} Z`;
  const xLabels = days
    .map((t) => new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))
    .filter((_, i) => i % 2 === 1);
  const inWindow = counts.reduce((a, b) => a + b, 0);
  const sources = countBy(jobs, (j) => j.source);
  const indianApiCount = sources.find(([s]) => s === 'INDIAN_API')?.[1] ?? 0;

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="page-desc">How jobs flow through the pipeline over time.</p>
      </div>

      <div role="note" className="note">
        <Icon name="alert" />
        <span>There's no analytics API yet. These charts are computed in your browser from the {jobs.length} jobs currently stored, using each job's posting date.</span>
      </div>

      <section aria-labelledby="ji-tl" className="card chart-card">
        <div className="chart-head">
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <h2 id="ji-tl" className="card-title">Jobs posted</h2>
            <div className="card-sub">Per day · last 14 days · {inWindow} in range</div>
          </div>
        </div>
        <div className="line-chart">
          <div className="line-chart-y" aria-hidden="true">
            {yTicks.map((y, i) => <span key={i}>{y}</span>)}
          </div>
          <div className="line-chart-plot">
            <svg role="img" aria-label={`Line chart of jobs posted per day over the last 14 days. Peak ${Math.max(...counts)} per day.`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
              {[0, 50, 100, 150, 200].map((g) => (
                <line key={g} x1="0" x2={W} y1={g} y2={g} stroke="var(--border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              ))}
              <path d={area} fill="var(--accent)" opacity="0.08" />
              <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="line-chart-x" aria-hidden="true">
              {xLabels.map((x) => <span key={x}>{x}</span>)}
            </div>
          </div>
        </div>
      </section>

      <div className="bar-grid">
        <BarCard title="Jobs by location" sub="Current job set" rows={countBy(jobs, (j) => city(j.location)).slice(0, 6)} />
        <BarCard title="Jobs by job type" sub="Current job set" rows={countBy(jobs, (j) => j.jobType).slice(0, 6)} />
        <BarCard title="Top companies" sub="By open roles" rows={countBy(jobs, (j) => j.company).slice(0, 6)} />
        <section className="card bar-card">
          <div style={{ minWidth: 0 }}>
            <h2 className="card-title">Jobs by source</h2>
            <div className="card-sub">Connected and planned providers</div>
          </div>
          <div className="bar-rows">
            <div className="bar-row">
              <span className="bar-row-label">IndianAPI</span>
              <div className="bar-track"><div className="bar-fill" style={{ width: indianApiCount ? '100%' : '0%' }} /></div>
              <span className="bar-value">{indianApiCount}</span>
            </div>
            {['LinkedIn', 'Indeed', 'Naukri'].map((name) => (
              <div key={name} className="bar-row">
                <span className="bar-row-label">{name}</span>
                <div className="bar-track" />
                <span className="bar-value is-faint">Not connected</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <SyncHistoryTable title="Recent ingestion activity" history={syncHistory} secondColumn="source" />
    </div>
  );
}
