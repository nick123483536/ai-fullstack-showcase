import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../api/types';
import { AreaChart, ChartLegend, useCountUp, type AreaSeries } from '../components/Charts';
import { Icon, type IconName } from '../components/Icon';
import { JobTable, JobTableSkeleton } from '../components/JobCard';
import { EmptyBlock, ErrorLine } from '../components/ui';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';
import { useReviewed } from '../context/ReviewedContext';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { countBy, formatCount, jobMinutes, postedTime, sortByPostedDesc, sourceLabel } from '../lib/format';

const DAY = 86400000;
const RANGES = [
  { days: 90, label: '3 months', smoothing: 5 },
  { days: 30, label: '30 days', smoothing: 2 },
  { days: 7, label: '7 days', smoothing: 1 },
];

/** The shortest range that still covers the stored postings, so a young database doesn't open on an empty chart. */
export function fittingRange<T extends { days: number }>(ranges: T[], jobs: Job[]) {
  const oldest = Math.max(0, ...jobs.map((j) => jobMinutes(j) ?? 0)) / 1440;
  return [...ranges].sort((a, b) => a.days - b.days).find((r) => r.days >= oldest + 1) ?? ranges[0];
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function startOfDay(t: number) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Roles per posting day, one series per source (sources after the first grouped when there are more than two). */
export function dailySeries(jobs: Job[], days: number) {
  const today = startOfDay(Date.now());
  const first = today - (days - 1) * DAY;
  const sources = countBy(jobs, (j) => j.source).map(([s]) => s);
  const keys = sources.length > 2 ? [sources[0], 'OTHER'] : sources;
  const values = keys.map(() => new Array(days).fill(0) as number[]);
  jobs.forEach((j) => {
    const t = postedTime(j);
    if (t === null || !keys.length) return;
    const idx = Math.round((startOfDay(t) - first) / DAY);
    if (idx < 0 || idx >= days) return;
    const k = keys.indexOf(j.source);
    values[k >= 0 ? k : keys.length - 1][idx] += 1;
  });
  const colors = ['var(--c1)', 'var(--c2)'];
  const series: AreaSeries[] = keys.map((k, i) => ({ label: k === 'OTHER' ? 'Other sources' : sourceLabel(k), color: colors[i], values: values[i] }));
  // The smaller source sits at the bottom so the larger one frames the chart.
  series.reverse();
  const pointLabels = Array.from({ length: days }, (_, i) => new Date(first + i * DAY).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));
  const total = values.flat().reduce((a, b) => a + b, 0);
  return { series, pointLabels, total };
}

interface StatProps {
  label: string;
  icon: IconName;
  value: number;
  suffix?: string;
  badge?: { text: string; tone: 'up' | 'down' | 'flat' };
  children: ReactNode;
}

export function StatCard({ label, icon, value, suffix, badge, children }: StatProps) {
  const shown = useCountUp(value);
  return (
    <div className="panel stat-card">
      <div className="stat-top">
        <span className="stat-icon"><Icon name={icon} size={17} /></span>
        <span className="stat-label">{label}</span>
        {badge && (
          <span className={`stat-badge is-${badge.tone}`}>
            {badge.tone === 'up' && <Icon name="trendUp" size={12} strokeWidth={2.5} />}
            {badge.tone === 'down' && <Icon name="trendDown" size={12} strokeWidth={2.5} />}
            {badge.text}
          </span>
        )}
      </div>
      <span className="stat-value num">{formatCount(Math.round(shown))}{suffix}</span>
      <div className="stat-foot">{children}</div>
    </div>
  );
}

type Tab = 'new' | 'all' | 'saved';

export function DashboardPage() {
  const { displayName } = usePreferences();
  const { isAdmin } = useAuth();
  const { savedIds } = useSavedJobs();
  const { isReviewed } = useReviewed();
  const { jobs, jobsStatus, jobsError, reloadJobs, syncing, setSyncModalOpen } = useWorkspace();
  const [rangeChoice, setRange] = useState<(typeof RANGES)[number] | null>(null);
  const [tab, setTab] = useState<Tab>('new');
  const range = rangeChoice ?? fittingRange(RANGES, jobs);

  const loading = jobsStatus === 'loading' && jobs.length === 0;
  const sorted = useMemo(() => sortByPostedDesc(jobs), [jobs]);
  const minutes = (j: Job) => jobMinutes(j) ?? Infinity;
  const fresh = sorted.filter((j) => minutes(j) < 1440);
  const previous = jobs.filter((j) => minutes(j) >= 1440 && minutes(j) < 2880).length;
  const unseen = fresh.filter((j) => !isReviewed(j.id));
  const savedSet = new Set(savedIds);
  const saved = sorted.filter((j) => savedSet.has(j.id));
  const week = jobs.filter((j) => minutes(j) < 10080);
  const priorWeek = new Set(jobs.filter((j) => minutes(j) >= 10080 && minutes(j) < 20160).map((j) => j.company));
  const weekCompanies = countBy(week, (j) => j.company);
  const newCompanies = weekCompanies.filter(([c]) => !priorWeek.has(c)).length;
  const chart = useMemo(() => dailySeries(jobs, range.days), [jobs, range.days]);

  const diff = fresh.length - previous;
  const firstName = capitalise(displayName.split(/\s+/)[0]);
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  const lists: Record<Tab, Job[]> = { new: fresh, all: sorted, saved };
  const tabs: { id: Tab; label: string }[] = [
    { id: 'new', label: 'Last 24 hours' },
    { id: 'all', label: 'All roles' },
    { id: 'saved', label: 'Saved' },
  ];
  const rows = lists[tab].slice(0, 8);
  const syncAction = isAdmin ? <button type="button" className="btn btn-primary" onClick={() => setSyncModalOpen(true)}>Sync sources</button> : undefined;

  let summary: ReactNode = 'Loading the roles stored in your database…';
  if (jobsStatus === 'error') summary = "Couldn't reach the job service, so there's nothing new to show.";
  else if (!loading && jobs.length === 0) summary = isAdmin ? 'No roles stored yet. Sync your sources to pull the first listings.' : 'No roles stored yet. New listings arrive every hour.';
  else if (!loading) {
    summary = (
      <>
        {today} · <strong>{fresh.length} new role{fresh.length === 1 ? '' : 's'}</strong> in the last 24 hours
        {fresh.length > 0 && (unseen.length > 0 ? `, ${unseen.length} you haven't opened yet` : ', all of them opened')}
      </>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">{greeting()}, {firstName}</h1>
          <p className="page-desc">{summary}</p>
        </div>
        <div className="page-actions">
          {isAdmin && (
            <button type="button" className="btn" disabled={syncing} onClick={() => setSyncModalOpen(true)}>
              <Icon name="refresh" size={16} />{syncing ? 'Syncing…' : 'Sync sources'}
            </button>
          )}
          <Link to="/jobs?postedWithin=24h" className="btn btn-primary">
            Review new roles<Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>

      <div className="stat-grid stagger">
        <StatCard
          label="New in 24 hours"
          icon="sparkles"
          value={fresh.length}
          badge={previous || fresh.length ? { text: diff === 0 ? 'Same' : `${diff > 0 ? '+' : ''}${diff}`, tone: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat' } : undefined}
        >
          {previous === 0 ? 'None in the 24 hours before' : <><b>{diff >= 0 ? 'Up' : 'Down'} from {previous}</b> the day before</>}
        </StatCard>
        <StatCard
          label="Unopened"
          icon="eye"
          value={unseen.length}
          badge={fresh.length ? { text: `${Math.round(((fresh.length - unseen.length) / fresh.length) * 100)}% seen`, tone: 'flat' } : undefined}
        >
          {unseen.length ? <><b>Open them early</b>, while few people have applied</> : 'You have seen every new role'}
        </StatCard>
        <StatCard label="Saved" icon="bookmark" value={savedIds.length}>
          {saved.length ? <><b>{saved.filter((j) => minutes(j) < 10080).length} posted this week</b>, apply before they close</> : 'Bookmark roles to keep them here'}
        </StatCard>
        <StatCard
          label="Hiring now"
          icon="building"
          value={weekCompanies.length}
          badge={newCompanies ? { text: `+${newCompanies} new`, tone: 'up' } : undefined}
        >
          {weekCompanies[0] ? <><b>{weekCompanies[0][0]}</b> posted the most this week</> : 'No roles in the last 7 days'}
        </StatCard>
      </div>

      <section className="panel chart-card rise" style={{ animationDelay: '0.2s' }} aria-labelledby="ji-chart">
        <div className="panel-head">
          <div>
            <h2 id="ji-chart" className="panel-title">Roles posted</h2>
            <div className="panel-sub">
              {formatCount(chart.total)} roles in the last {range.label}{range.smoothing > 1 ? `, ${range.smoothing}-day average` : ''}
            </div>
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
          {jobsStatus === 'error' ? (
            <ErrorLine message={`Couldn't load jobs. ${jobsError}`} onRetry={reloadJobs} />
          ) : loading ? (
            <span className="skeleton-bar" style={{ height: 240 }} />
          ) : (
            <AreaChart
              series={chart.series}
              pointLabels={chart.pointLabels}
              smoothing={range.smoothing}
              animationKey={range.days}
              ariaLabel={`Roles posted per day over the last ${range.label}: ${chart.total} in total.`}
            />
          )}
        </div>
      </section>

      <section className="rise" style={{ animationDelay: '0.3s', display: 'flex', flexDirection: 'column', gap: 14 }} aria-labelledby="ji-roles">
        <div className="table-bar">
          <h2 id="ji-roles" className="sr-only">Roles</h2>
          <div role="tablist" aria-label="Which roles" className="tabs">
            {tabs.map((t) => (
              <button key={t.id} type="button" role="tab" className="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
                {t.label}<span className="count num">{lists[t.id].length}</span>
              </button>
            ))}
          </div>
          <Link to={tab === 'saved' ? '/saved' : tab === 'new' ? '/jobs?postedWithin=24h' : '/jobs'} className="btn">
            View all<Icon name="arrowRight" size={16} />
          </Link>
        </div>
        <div className="panel panel-clip">
          {loading && <JobTableSkeleton rows={6} />}
          {jobsStatus === 'error' && <ErrorLine message={`Couldn't load jobs. ${jobsError}`} onRetry={reloadJobs} />}
          {!loading && jobsStatus !== 'error' && rows.length === 0 && (
            tab === 'saved'
              ? <EmptyBlock icon="bookmark" title="Nothing saved yet">Use the bookmark on any role to keep it here until you apply.</EmptyBlock>
              : tab === 'new'
                ? <EmptyBlock icon="clock" title="Nothing new in the last 24 hours" action={syncAction}>New listings arrive every hour{isAdmin ? '. You can also sync now.' : '.'}</EmptyBlock>
                : <EmptyBlock title="No roles stored yet" action={syncAction}>{isAdmin ? "Pull the first listings from your sources and they'll appear here." : 'Listings arrive automatically every hour. Check back soon.'}</EmptyBlock>
          )}
          {rows.length > 0 && <JobTable jobs={rows} caption="Roles" />}
          {rows.length > 0 && (
            <div className="panel-foot">
              <span className="num">Showing {rows.length} of {lists[tab].length}</span>
              <span>Opening a role marks it as seen</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
