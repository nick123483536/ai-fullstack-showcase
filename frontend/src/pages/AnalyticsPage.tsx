import { useMemo, useState } from 'react';
import { AreaChart, BarList, ChartLegend } from '../components/Charts';
import { ErrorLine, LogoTile } from '../components/ui';
import { useWorkspace } from '../context/WorkspaceContext';
import { city, countBy, formatCount, jobMinutes, typeLabel } from '../lib/format';
import { dailySeries, fittingRange, StatCard } from './DashboardPage';

const RANGES = [
  { days: 90, label: '3 months', smoothing: 5 },
  { days: 30, label: '30 days', smoothing: 2 },
  { days: 7, label: '7 days', smoothing: 1 },
];

export function AnalyticsPage() {
  const { jobs, jobsStatus, jobsError, reloadJobs } = useWorkspace();
  const [rangeChoice, setRange] = useState<(typeof RANGES)[number] | null>(null);
  const range = rangeChoice ?? fittingRange(RANGES, jobs);
  const chart = useMemo(() => dailySeries(jobs, range.days), [jobs, range.days]);

  const minutes = (m: number | null) => m ?? Infinity;
  const last30 = jobs.filter((j) => minutes(jobMinutes(j)) < 43200).length;
  const prior30 = jobs.filter((j) => {
    const m = minutes(jobMinutes(j));
    return m >= 43200 && m < 86400;
  }).length;
  const companies = countBy(jobs, (j) => j.company);
  const cities = countBy(jobs, (j) => city(j.location));
  const types = countBy(jobs, (j) => typeLabel(j.jobType));
  const remote = jobs.filter((j) => /remote|worldwide/i.test(`${j.location} ${j.jobType}`)).length;
  const remoteShare = jobs.length ? Math.round((remote / jobs.length) * 100) : 0;
  const undated = jobs.filter((j) => jobMinutes(j) === null).length;
  const diff = last30 - prior30;

  let finding = 'Loading the roles stored in your database…';
  if (jobsStatus === 'error') finding = "Couldn't load jobs, so there's nothing to chart yet.";
  else if (jobsStatus === 'ready' && jobs.length === 0) finding = 'No roles are stored yet.';
  else if (jobs.length > 0) {
    finding = `${formatCount(last30)} role${last30 === 1 ? '' : 's'} posted in the last 30 days.`
      + (cities[0] ? ` ${cities[0][0]} leads with ${cities[0][1]} of ${formatCount(jobs.length)} stored.` : '')
      + (undated ? ` ${undated} role${undated === 1 ? ' has' : 's have'} no posting date.` : '');
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-desc">{finding}</p>
        </div>
        <span className="muted" style={{ fontSize: 13 }}>Computed in your browser from {formatCount(jobs.length)} stored roles</span>
      </div>

      <div className="stat-grid stagger">
        <StatCard label="Roles stored" icon="briefcase" value={jobs.length}>
          {chart.series.length ? <>From <b>{chart.series.map((s) => s.label).reverse().join(' and ')}</b></> : 'No source has delivered roles yet'}
        </StatCard>
        <StatCard
          label="Posted in 30 days"
          icon="trendUp"
          value={last30}
          badge={prior30 || last30 ? { text: diff === 0 ? 'Same' : `${diff > 0 ? '+' : ''}${diff}`, tone: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat' } : undefined}
        >
          {prior30 ? <><b>{diff >= 0 ? 'Up' : 'Down'} from {prior30}</b> the 30 days before</> : 'Nothing in the 30 days before'}
        </StatCard>
        <StatCard label="Companies" icon="building" value={companies.length}>
          {companies[0] ? <><b>{companies[0][0]}</b> has the most open roles ({companies[0][1]})</> : 'No companies yet'}
        </StatCard>
        <StatCard label="Remote share" icon="globe" value={remoteShare} suffix="%" badge={{ text: `${remote} role${remote === 1 ? '' : 's'}`, tone: 'flat' }}>
          <b>{remoteShare}%</b> of stored roles can be done remotely
        </StatCard>
      </div>

      {jobsStatus === 'error' ? (
        <section className="panel"><ErrorLine message={`Couldn't load jobs. ${jobsError}`} onRetry={reloadJobs} /></section>
      ) : (
        <section className="panel chart-card rise" style={{ animationDelay: '0.2s' }} aria-labelledby="ji-an-chart">
          <div className="panel-head">
            <div>
              <h2 id="ji-an-chart" className="panel-title">Roles posted per day</h2>
              <div className="panel-sub">{formatCount(chart.total)} in the last {range.label}, by posting date{range.smoothing > 1 ? `, ${range.smoothing}-day average` : ''}</div>
            </div>
            <div className="chart-tools">
              <ChartLegend items={[...chart.series].reverse().map((s) => ({ label: s.label, color: s.color }))} />
              <div role="radiogroup" aria-label="Time range" className="segmented">
                {RANGES.map((r) => (
                  <button key={r.days} type="button" role="radio" aria-checked={r.days === range.days} onClick={() => setRange(r)}>{r.label}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="panel-body">
            <AreaChart series={chart.series} pointLabels={chart.pointLabels} smoothing={range.smoothing} animationKey={range.days} height={260} ariaLabel={`Roles posted per day over the last ${range.label}: ${chart.total} in total.`} />
          </div>
        </section>
      )}

      <div className="three-col rise" style={{ animationDelay: '0.3s' }}>
        <section className="panel" aria-labelledby="ji-an-loc">
          <div className="panel-head"><div><h2 id="ji-an-loc" className="panel-title">Top locations</h2><div className="panel-sub">Top 5 of all stored roles</div></div></div>
          <div className="panel-body">
            {cities.length ? <BarList caption="Top locations" rows={cities.slice(0, 5).map(([label, value]) => ({ label, value, href: `/jobs?location=${encodeURIComponent(label)}` }))} /> : <p className="muted">No roles stored yet.</p>}
          </div>
        </section>
        <section className="panel" aria-labelledby="ji-an-co">
          <div className="panel-head"><div><h2 id="ji-an-co" className="panel-title">Top companies</h2><div className="panel-sub">By open roles</div></div></div>
          <div className="panel-body">
            {companies.length ? <BarList caption="Top companies" rows={companies.slice(0, 5).map(([label, value]) => ({ label, value, lead: <LogoTile name={label} size={30} />, href: `/jobs?company=${encodeURIComponent(label)}` }))} /> : <p className="muted">No roles stored yet.</p>}
          </div>
        </section>
        <section className="panel" aria-labelledby="ji-an-type">
          <div className="panel-head"><div><h2 id="ji-an-type" className="panel-title">Job types</h2><div className="panel-sub">Share of all stored roles</div></div></div>
          <div className="panel-body">
            {types.length ? <BarList caption="Job types" rows={types.slice(0, 5).map(([label, value]) => ({ label, value }))} valueLabel={(v) => `${v} · ${Math.round((v / jobs.length) * 100)}%`} /> : <p className="muted">No roles stored yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
