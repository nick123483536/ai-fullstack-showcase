import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getJob } from '../api';
import { ApiError, errorMessage, isAbortError } from '../api/client';
import type { Job } from '../api/types';
import { Icon, type IconName } from '../components/Icon';
import { PostedTime } from '../components/JobCard';
import { EmptyBlock, ErrorLine, LogoTile, Pill } from '../components/ui';
import { useReviewed } from '../context/ReviewedContext';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { city, formatIso, isFreshJob, jobPosted, postedTime, sortByPostedDesc, sourceLabel, typeLabel } from '../lib/format';

const PLANNED: [IconName, string, string][] = [
  ['target', 'Resume match', 'How this role lines up with your resume.'],
  ['sparkles', 'Skill gaps', 'What to strengthen before you apply.'],
  ['message', 'Interview topics', 'Likely questions for this role and company.'],
];

type State = { status: 'loading' } | { status: 'ready'; job: Job } | { status: 'notFound' } | { status: 'error'; message: string };

function Crumb({ title }: { title?: string }) {
  return (
    <div className="crumb">
      <Link to="/jobs">All jobs</Link>
      {title && <><Icon name="chevRight" size={13} /><span className="truncate">{title}</span></>}
    </div>
  );
}

function RoleList({ jobs, sub }: { jobs: Job[]; sub: (j: Job) => string }) {
  return (
    <ul className="mini-list stagger">
      {jobs.map((j) => (
        <li key={j.id}>
          <Link to={`/jobs/${j.id}`}>
            <LogoTile name={j.company} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <span className="mini-title truncate">{j.title}</span>
              <div className="mini-sub"><span className="truncate">{sub(j)}</span><PostedTime job={j} /></div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function JobDetailsPage() {
  const { id } = useParams();
  const jobId = Number(id);
  const { jobs: allJobs } = useWorkspace();
  const { isSaved, toggleSave } = useSavedJobs();
  const { markReviewed } = useReviewed();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [retryKey, setRetryKey] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(jobId)) {
      setState({ status: 'notFound' });
      return;
    }
    const ctrl = new AbortController();
    setState({ status: 'loading' });
    setCopied(false);
    getJob(jobId, ctrl.signal)
      .then((job) => {
        setState({ status: 'ready', job });
        markReviewed(job.id);
      })
      .catch((err) => {
        if (isAbortError(err)) return;
        if (err instanceof ApiError && err.status === 404) setState({ status: 'notFound' });
        else setState({ status: 'error', message: errorMessage(err) });
      });
    return () => ctrl.abort();
  }, [jobId, retryKey, markReviewed]);

  if (state.status !== 'ready') {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <Crumb />
            {state.status === 'loading' && (
              <div aria-busy="true" style={{ display: 'flex', gap: 18, alignItems: 'center', paddingTop: 4 }}>
                <span className="skeleton-bar" style={{ width: 60, height: 60, borderRadius: 16 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span className="skeleton-bar" style={{ height: 26, width: '45%' }} />
                  <span className="skeleton-bar" style={{ height: 14, width: '30%' }} />
                </div>
              </div>
            )}
            {state.status === 'notFound' && <h1 className="page-title">Job not found</h1>}
            {state.status === 'error' && <h1 className="page-title">Job</h1>}
          </div>
        </div>
        {state.status === 'notFound' && (
          <section className="panel">
            <EmptyBlock icon="search" title="This listing is no longer stored" action={<Link to="/jobs" className="btn">Browse jobs</Link>}>
              It may have been removed from the database since you opened the link.
            </EmptyBlock>
          </section>
        )}
        {state.status === 'error' && (
          <section className="panel">
            <ErrorLine message={`Couldn't load this job. ${state.message}`} onRetry={() => setRetryKey((k) => k + 1)} />
          </section>
        )}
      </div>
    );
  }

  const { job } = state;
  const saved = isSaved(job.id);
  const posted = postedTime(job);
  const jobCity = city(job.location);
  const others = allJobs.filter((j) => j.id !== job.id);
  const atCompany = sortByPostedDesc(others.filter((j) => j.company === job.company)).slice(0, 3);
  let similar = others.filter((j) => j.jobType === job.jobType && city(j.location) === jobCity && j.company !== job.company);
  if (similar.length < 4) similar = similar.concat(others.filter((j) => j.jobType === job.jobType && j.company !== job.company && !similar.includes(j)));
  similar = sortByPostedDesc(similar).slice(0, 5);
  const fresh = isFreshJob(job);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(job.jobUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <Crumb title={job.title} />
          <div className="detail-head">
            <LogoTile name={job.company} size={60} />
            <div style={{ minWidth: 0 }}>
              <h1 className="page-title">{job.title}</h1>
              <div className="detail-meta">
                <span className="pill tone-neutral"><Icon name="building" size={13} />{job.company}</span>
                <span className="outline-pill"><Icon name="pin" size={13} style={{ marginRight: 5 }} />{job.location}</span>
                <span className="outline-pill">{typeLabel(job.jobType)}</span>
                {fresh ? <Pill tone="brand"><span className="ping" />Posted {jobPosted(job)}</Pill> : <span className="outline-pill">Posted {jobPosted(job)}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="page-actions">
          <button type="button" className="btn" aria-pressed={saved} onClick={() => toggleSave(job.id)}>
            <Icon name="bookmark" size={16} filled={saved} style={saved ? { color: 'var(--primary)' } : undefined} />{saved ? 'Saved' : 'Save'}
          </button>
          <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Apply on company site<Icon name="external" size={15} />
          </a>
        </div>
      </div>

      <div className="detail-grid rise" style={{ animationDelay: '0.1s' }}>
        <div className="detail-side">
          <section aria-labelledby="ji-listing" className="panel">
            <div className="panel-head">
              <div>
                <h2 id="ji-listing" className="panel-title">Listing</h2>
                <div className="panel-sub">
                  {fresh ? 'Posted in the last 24 hours, so you are early.' : `Posted ${jobPosted(job)}.`} The full description is on the company's posting.
                </div>
              </div>
            </div>
            <div className="panel-body">
              <dl className="kv">
                <dt>Company</dt><dd>{job.company}</dd>
                <dt>Location</dt><dd>{job.location}</dd>
                <dt>Job type</dt><dd>{typeLabel(job.jobType)}</dd>
                <dt>Source</dt><dd>{sourceLabel(job.source)}</dd>
                <dt>Posted</dt><dd className="num">{posted === null ? '—' : `${formatIso(posted)} · ${jobPosted(job)}`}</dd>
                <dt>Job ID</dt><dd className="mono">{job.id}</dd>
              </dl>
              <div className="url-row">
                <code title={job.jobUrl}>{job.jobUrl}</code>
                <button type="button" className="btn" onClick={copyUrl}>
                  <Icon name={copied ? 'check' : 'copy'} size={15} />{copied ? 'Copied' : 'Copy link'}
                </button>
              </div>
            </div>
          </section>

          <section aria-labelledby="ji-ai" className="panel">
            <div className="panel-head">
              <div>
                <h2 id="ji-ai" className="panel-title">Analysis</h2>
                <div className="panel-sub">Coming later. Nothing below is scored or generated yet.</div>
              </div>
              <Pill tone="warning">Planned</Pill>
            </div>
            <div className="panel-body">
              <ul className="planned-list">
                {PLANNED.map(([icon, name, desc]) => (
                  <li key={name}><span className="ico"><Icon name={icon} size={16} /></span><div><b>{name}</b><span>{desc}</span></div></li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <div className="detail-side">
          <section aria-labelledby="ji-co" className="panel">
            <div className="panel-head"><h2 id="ji-co" className="panel-title">More at {job.company}</h2></div>
            {atCompany.length === 0
              ? <p className="empty-line">No other {job.company} roles are stored.</p>
              : <RoleList jobs={atCompany} sub={(j) => city(j.location)} />}
          </section>

          <section aria-labelledby="ji-sim" className="panel">
            <div className="panel-head">
              <div>
                <h2 id="ji-sim" className="panel-title">Similar roles</h2>
                <div className="panel-sub">{typeLabel(job.jobType)}, {jobCity} first</div>
              </div>
            </div>
            {similar.length === 0
              ? <p className="empty-line">No similar roles are stored.</p>
              : <RoleList jobs={similar} sub={(j) => `${j.company} · ${city(j.location)}`} />}
          </section>
        </div>
      </div>
    </div>
  );
}
