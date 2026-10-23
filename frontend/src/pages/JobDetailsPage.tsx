import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getJob } from '../api';
import { ApiError, errorMessage, isAbortError } from '../api/client';
import type { Job } from '../api/types';
import { Icon, type IconName } from '../components/Icon';
import { EmptyState, ErrorState, Pill, SourceTag, StatusBadge } from '../components/ui';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { city, formatDateTime, initials, jobPosted, minutesSince, postedTime, relativeTime, sortByPostedDesc, sourceLabel } from '../lib/format';

const AI_FEATURES: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'target', title: 'Resume match', desc: 'Compare this role with your resume.' },
  { icon: 'gap', title: 'Skill gap analysis', desc: 'Skills to strengthen for this role.' },
  { icon: 'message', title: 'Interview preparation', desc: 'Likely topics and questions.' },
  { icon: 'chart', title: 'Job fit analysis', desc: 'How this role aligns with your goals.' },
];

type State = { status: 'loading' } | { status: 'ready'; job: Job } | { status: 'notFound' } | { status: 'error'; message: string };

function BackLink() {
  return (
    <Link to="/jobs" className="link-btn back-link">
      <Icon name="arrowLeft" size={14} strokeWidth={2} />Back to jobs
    </Link>
  );
}

export function JobDetailsPage() {
  const { id } = useParams();
  const jobId = Number(id);
  const { jobs: allJobs, lastSync } = useWorkspace();
  const { isSaved, toggleSave } = useSavedJobs();
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
      .then((job) => setState({ status: 'ready', job }))
      .catch((err) => {
        if (isAbortError(err)) return;
        if (err instanceof ApiError && err.status === 404) setState({ status: 'notFound' });
        else setState({ status: 'error', message: errorMessage(err) });
      });
    return () => ctrl.abort();
  }, [jobId, retryKey]);

  if (state.status === 'loading') {
    return (
      <div className="page" style={{ gap: 16 }} aria-busy="true">
        <BackLink />
        <div className="card job-hero">
          <div className="skeleton-bar" style={{ width: 52, height: 52, borderRadius: 10 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="skeleton-bar" style={{ height: 20, width: '50%' }} />
            <div className="skeleton-bar" style={{ height: 12, width: '25%' }} />
            <div className="skeleton-bar" style={{ height: 12, width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'notFound') {
    return (
      <div className="page" style={{ gap: 16 }}>
        <BackLink />
        <EmptyState icon="search" title="Job not found" action={<Link to="/jobs" className="btn btn-md">Browse jobs</Link>}>
          This listing may have been removed from the database.
        </EmptyState>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="page" style={{ gap: 16 }}>
        <BackLink />
        <ErrorState title="Unable to load this job." message={state.message} onRetry={() => setRetryKey((k) => k + 1)} />
      </div>
    );
  }

  const { job } = state;
  const saved = isSaved(job.id);
  const posted = postedTime(job);
  const jobCity = city(job.location);
  let similar = allJobs.filter((j) => j.id !== job.id && j.jobType === job.jobType && city(j.location) === jobCity);
  if (similar.length < 3) {
    similar = similar.concat(allJobs.filter((j) => j.id !== job.id && j.jobType === job.jobType && !similar.includes(j)));
  }
  similar = sortByPostedDesc(similar).slice(0, 4);

  const fields: { k: string; v: string; mono?: boolean }[] = [
    { k: 'Company', v: job.company },
    { k: 'Location', v: job.location },
    { k: 'Job type', v: job.jobType },
    { k: 'Source', v: job.source, mono: true },
    { k: 'Posted date', v: posted === null ? 'Unknown' : `${formatDateTime(posted)} · ${jobPosted(job)}` },
    { k: 'Job ID', v: `#${job.id}`, mono: true },
  ];

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(job.jobUrl);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="page" style={{ gap: 16 }}>
      <BackLink />

      <section className="card job-hero">
        <div className="tile tile-52" aria-hidden="true">{initials(job.company)}</div>
        <div className="job-hero-body">
          <h1 className="page-title">{job.title}</h1>
          <div className="job-hero-company">{job.company}</div>
          <div className="job-hero-meta">
            <span className="meta-item"><Icon name="pin" size={14} />{job.location}</span>
            <span className="meta-item"><Icon name="briefcase" size={14} />{job.jobType}</span>
            <span className="meta-item"><Icon name="clock" size={14} />Posted {jobPosted(job)}</span>
            <SourceTag>{job.source}</SourceTag>
          </div>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn save-btn"
            style={{ height: 38 }}
            aria-pressed={saved}
            onClick={() => toggleSave(job.id)}
          >
            <Icon name="bookmark" size={15} filled={saved} />{saved ? 'Saved' : 'Save job'}
          </button>
          <a href={job.jobUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ height: 38, padding: '0 16px' }}>
            Apply to job<Icon name="external" size={14} strokeWidth={2} />
          </a>
        </div>
      </section>

      <div className="two-col">
        <div className="side-col">
          <section aria-labelledby="ji-ov" className="card">
            <div className="card-head bordered"><h2 id="ji-ov" className="card-title">Overview</h2></div>
            <dl className="dl-grid">
              {fields.map((f) => (
                <div key={f.k} style={{ minWidth: 0 }}>
                  <dt>{f.k}</dt>
                  <dd className={f.mono ? 'mono' : undefined}>{f.v}</dd>
                </div>
              ))}
            </dl>
            <div className="url-box">
              <span className="card-sub" style={{ fontSize: 12 }}>External job URL</span>
              <div className="url-row">
                <code title={job.jobUrl}>{job.jobUrl}</code>
                <button type="button" className="btn btn-md" style={{ padding: '0 12px', fontSize: 13, gap: 6 }} onClick={copyUrl}>
                  <Icon name={copied ? 'check' : 'copy'} size={14} />{copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="card-sub" style={{ marginTop: 4 }}>
                The source provides structured listing metadata. The full description is available on the original posting.
              </p>
            </div>
          </section>

          <section aria-labelledby="ji-ai" className="card">
            <div className="card-head bordered" style={{ justifyContent: 'flex-start', gap: 10 }}>
              <Icon name="sparkles" style={{ color: 'var(--accent-text)' }} />
              <h2 id="ji-ai" className="card-title" style={{ flex: 1 }}>AI Job Intelligence</h2>
              <Pill>Coming soon</Pill>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p className="muted" style={{ fontSize: 13.5, textWrap: 'pretty' }}>
                Planned capabilities that will analyze this role against your profile. None of these are active yet — no scores or insights are generated.
              </p>
              <div className="ai-grid">
                {AI_FEATURES.map((a) => (
                  <div key={a.title} className="ai-item">
                    <Icon name={a.icon} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{a.title}</div>
                      <div className="card-sub">{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="side-col">
          <section aria-labelledby="ji-dsrc" className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h2 id="ji-dsrc" className="card-title">Source</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="tile tile-32 is-accent" aria-hidden="true">{initials(job.source.replace(/_/g, ' '))}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="list-row-title">{sourceLabel(job.source)} Jobs API</div>
                <div className="list-row-sub">{lastSync ? `Last synced ${relativeTime(minutesSince(lastSync))}` : 'Not synced from this browser'}</div>
              </div>
              <StatusBadge tone="success">Active</StatusBadge>
            </div>
          </section>

          <section aria-labelledby="ji-sim" className="card card-clip">
            <div style={{ padding: '14px 18px', minWidth: 0 }}>
              <h2 id="ji-sim" className="card-title">Similar roles</h2>
              <div className="card-sub">Same job type and city</div>
            </div>
            {similar.length === 0 && <div className="inline-empty">No similar roles in the current job set.</div>}
            {similar.map((s) => (
              <Link key={s.id} to={`/jobs/${s.id}`} className="similar-item">
                <div className="list-row-title truncate">{s.title}</div>
                <div className="list-row-sub">{s.company} · {jobPosted(s)}</div>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
