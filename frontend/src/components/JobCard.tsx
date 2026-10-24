import { Link } from 'react-router-dom';
import type { Job } from '../api/types';
import { useReviewed } from '../context/ReviewedContext';
import { useSavedJobs } from '../context/SavedJobsContext';
import { city, isFreshJob, jobPosted, sourceLabel, typeLabel } from '../lib/format';
import { Icon } from './Icon';
import { LogoTile } from './ui';

/** Posted time; roles under 24 hours old get the brand colour and a live dot. */
export function PostedTime({ job }: { job: Job }) {
  const fresh = isFreshJob(job);
  return (
    <span className={`posted num${fresh ? ' is-fresh' : ''}`}>
      {fresh && <span className="ping" aria-hidden="true" />}
      {jobPosted(job)}
    </span>
  );
}

/** New (fresh and not opened yet), Saved, Not opened, or Seen. */
export function JobStatus({ job }: { job: Job }) {
  const { isSaved } = useSavedJobs();
  const { isReviewed } = useReviewed();
  if (isSaved(job.id)) return <span className="pill tone-neutral"><Icon name="bookmark" size={12} filled />Saved</span>;
  if (!isReviewed(job.id) && isFreshJob(job)) return <span className="pill tone-brand"><span className="ping" />New</span>;
  if (!isReviewed(job.id)) return <span className="outline-pill">Not opened</span>;
  return <span className="outline-pill"><Icon name="check" size={12} style={{ marginRight: 4 }} />Seen</span>;
}

export function SaveButton({ job }: { job: Job }) {
  const { isSaved, toggleSave } = useSavedJobs();
  const saved = isSaved(job.id);
  return (
    <button
      type="button"
      className="icon-btn sm save-btn"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${job.title} from saved` : `Save ${job.title}`}
      title={saved ? 'Saved' : 'Save'}
      onClick={() => toggleSave(job.id)}
    >
      <Icon name="bookmark" size={16} filled={saved} />
    </button>
  );
}

export function ApplyLink({ job }: { job: Job }) {
  const { markReviewed } = useReviewed();
  return (
    <a
      href={job.jobUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="apply-btn"
      onClick={() => markReviewed(job.id)}
      aria-label={`Apply to ${job.title} at ${job.company} (opens the company site)`}
    >
      Apply<Icon name="external" size={13} strokeWidth={2} />
    </a>
  );
}

interface JobTableProps {
  jobs: Job[];
  /** Hide the type and source columns, for narrow blocks. */
  compact?: boolean;
  caption: string;
}

/** Jobs as rows: the company and role first, then type, status, source and age, and the two actions at the end. */
export function JobTable({ jobs, compact, caption }: JobTableProps) {
  const { isReviewed } = useReviewed();
  return (
    <div className="table-scroll">
      <table className={`dtable job-table${compact ? ' is-compact' : ''}`}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Role</th>
            {!compact && <th scope="col" className="col-type">Type</th>}
            <th scope="col" className="col-status">Status</th>
            {!compact && <th scope="col" className="col-source">Source</th>}
            <th scope="col" className="num col-posted">Posted</th>
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="stagger">
          {jobs.map((job) => (
            <tr key={job.id} className={isReviewed(job.id) ? undefined : 'is-unseen'}>
              <td className="col-role">
                <div className="role">
                  <LogoTile name={job.company} />
                  <div style={{ minWidth: 0 }}>
                    <Link to={`/jobs/${job.id}`} className="role-title">{job.title}</Link>
                    <div className="role-sub">
                      <span>{job.company}</span> · {city(job.location)}
                      <span className="role-sub-extra"> · {typeLabel(job.jobType)}</span>
                    </div>
                    <div className="role-sub-posted"><PostedTime job={job} /></div>
                  </div>
                </div>
              </td>
              {!compact && <td className="col-type"><span className="outline-pill">{typeLabel(job.jobType)}</span></td>}
              <td className="col-status"><JobStatus job={job} /></td>
              {!compact && <td className="col-source muted">{sourceLabel(job.source)}</td>}
              <td className="num col-posted"><PostedTime job={job} /></td>
              <td className="col-actions">
                <div className="row-actions">
                  <SaveButton job={job} />
                  <ApplyLink job={job} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SKELETON_WIDTHS = ['46%', '38%', '54%', '42%', '50%', '36%'];

/** Rows at their real pitch while the jobs load. */
export function JobTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading jobs">
      {SKELETON_WIDTHS.slice(0, rows).map((w, i) => (
        <div key={i} className="skeleton-row">
          <span className="skeleton-bar" style={{ width: 36, height: 36, borderRadius: 10, flex: 'none' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="skeleton-bar" style={{ height: 12, width: w }} />
            <span className="skeleton-bar" style={{ height: 10, width: '24%' }} />
          </div>
          <span className="skeleton-bar" style={{ height: 24, width: 64, borderRadius: 999 }} />
        </div>
      ))}
    </div>
  );
}
