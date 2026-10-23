import { Link, useNavigate } from 'react-router-dom';
import type { Job } from '../api/types';
import { Icon, type IconName } from '../components/Icon';
import { RowSkeleton, SourceTag, StatusBadge, type Tone } from '../components/ui';
import { usePreferences } from '../context/PreferencesContext';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { initials, jobMinutes, jobPosted, minutesSince, relativeTime, sortByPostedDesc } from '../lib/format';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function RecentJobRow({ job }: { job: Job }) {
  const { isSaved, toggleSave } = useSavedJobs();
  const saved = isSaved(job.id);
  return (
    <div className="list-row is-hover">
      <div className="tile tile-32" aria-hidden="true" style={{ fontSize: 12 }}>{initials(job.company)}</div>
      <Link to={`/jobs/${job.id}`} className="list-row-main">
        <div className="list-row-title truncate">{job.title}</div>
        <div className="list-row-sub truncate">{job.company} · {job.location}</div>
      </Link>
      <span className="recent-type hide-mobile">{job.jobType}</span>
      <span className="hide-mobile"><SourceTag>{job.source}</SourceTag></span>
      <span className="recent-time">{jobPosted(job)}</span>
      <button
        type="button"
        className="icon-btn-ghost"
        style={{ color: saved ? 'var(--accent-text)' : 'var(--text-2)' }}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${job.title} from saved` : `Save ${job.title}`}
        onClick={() => toggleSave(job.id)}
      >
        <Icon name="bookmark" size={15} filled={saved} />
      </button>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { displayName, jobsUrl } = usePreferences();
  const { savedIds } = useSavedJobs();
  const { jobs, jobsStatus, jobsError, reloadJobs, lastSync, setSyncModalOpen } = useWorkspace();

  const loading = jobsStatus === 'loading' && jobs.length === 0;
  const newToday = jobs.filter((j) => (jobMinutes(j) ?? Infinity) < 1440).length;
  const recent = sortByPostedDesc(jobs).slice(0, 7);
  const firstName = displayName.split(/\s+/)[0];

  const metrics: { label: string; icon: IconName; value: string | number; sub: string; up?: boolean }[] = [
    { label: 'Total jobs', icon: 'briefcase', value: loading ? '—' : jobs.length.toLocaleString('en-IN'), sub: `+${newToday} in the last 24 hours`, up: true },
    { label: 'New today', icon: 'clock', value: loading ? '—' : newToday, sub: 'From IndianAPI' },
    { label: 'Saved', icon: 'bookmark', value: savedIds.length, sub: 'Stored on this device' },
    { label: 'Active sources', icon: 'db', value: 1, sub: '3 more planned' },
  ];

  const sources: { name: string; initials: string; meta: string; status: string; tone: Tone; active?: boolean }[] = [
    {
      name: 'IndianAPI', initials: 'IA', active: true, status: 'Active', tone: 'success',
      meta: lastSync ? `Synced ${relativeTime(minutesSince(lastSync))} · ${jobs.length} jobs` : `${jobs.length} jobs stored`,
    },
    { name: 'LinkedIn', initials: 'LI', meta: 'Not connected', status: 'Coming soon', tone: 'muted' },
    { name: 'Indeed', initials: 'IN', meta: 'Not connected', status: 'Coming soon', tone: 'muted' },
  ];

  const quickActions: { label: string; icon: IconName; onClick: () => void }[] = [
    { label: 'Search jobs', icon: 'search', onClick: () => navigate(jobsUrl) },
    { label: 'View recent jobs', icon: 'clockBack', onClick: () => navigate('/jobs?postedWithin=24h') },
    { label: 'Run ingestion', icon: 'refresh', onClick: () => setSyncModalOpen(true) },
    { label: 'Manage sources', icon: 'db', onClick: () => navigate('/sources') },
  ];

  return (
    <div className="page page-lg">
      <div className="page-head">
        <div>
          <h1 className="page-title">{greeting()}, {firstName}</h1>
          <p className="page-desc">Here's what's happening with your job intelligence.</p>
        </div>
        <div className="actions">
          <button type="button" className="btn" onClick={() => setSyncModalOpen(true)}>
            <Icon name="refresh" size={15} />Run ingestion
          </button>
          <Link to={jobsUrl} className="btn btn-primary">
            <Icon name="search" size={15} strokeWidth={2} />Search jobs
          </Link>
        </div>
      </div>

      <div className="metrics">
        {metrics.map((m) => (
          <div key={m.label} className="card metric">
            <div className="metric-label">{m.label}<Icon name={m.icon} size={15} /></div>
            <div className="metric-value">{m.value}</div>
            <div className={`metric-sub${m.up ? ' is-up' : ''}`}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <section aria-labelledby="ji-recent" className="card card-clip">
          <div className="card-head">
            <div style={{ minWidth: 0 }}>
              <h2 id="ji-recent" className="card-title">Recent jobs</h2>
              <div className="card-sub">Latest from the ingestion pipeline</div>
            </div>
            <Link to="/jobs" className="link-btn">View all<Icon name="arrowRight" size={14} strokeWidth={2} /></Link>
          </div>
          {loading && <RowSkeleton rows={5} />}
          {jobsStatus === 'error' && (
            <div className="inline-empty" role="alert">
              {jobsError}{' '}
              <button type="button" className="link-btn" onClick={reloadJobs}>Try again</button>
            </div>
          )}
          {jobsStatus !== 'error' && !loading && recent.length === 0 && (
            <div className="inline-empty">
              No jobs yet. <button type="button" className="link-btn" onClick={() => setSyncModalOpen(true)}>Run ingestion</button> to pull listings from IndianAPI.
            </div>
          )}
          {recent.map((job) => <RecentJobRow key={job.id} job={job} />)}
        </section>

        <div className="side-col">
          <section aria-labelledby="ji-src" className="card card-clip">
            <div className="card-head">
              <h2 id="ji-src" className="card-title">Job sources</h2>
              <Link to="/sources" className="link-btn">Manage</Link>
            </div>
            {sources.map((s) => (
              <div key={s.name} className="list-row" style={{ padding: '12px 16px' }}>
                <div className={`tile tile-32 ${s.active ? 'is-accent' : 'is-faint'}`} aria-hidden="true">{s.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="list-row-title">{s.name}</div>
                  <div className="list-row-sub">{s.meta}</div>
                </div>
                <StatusBadge tone={s.tone}>{s.status}</StatusBadge>
              </div>
            ))}
          </section>

          <section aria-labelledby="ji-qa" className="card" style={{ padding: '14px 16px 16px' }}>
            <h2 id="ji-qa" className="card-title" style={{ marginBottom: 12 }}>Quick actions</h2>
            <div className="quick-actions">
              {quickActions.map((q) => (
                <button key={q.label} type="button" className="quick-action" onClick={q.onClick}>
                  <Icon name={q.icon} />{q.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
