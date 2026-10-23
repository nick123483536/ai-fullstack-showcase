import { Link } from 'react-router-dom';
import type { Job } from '../api/types';
import { useSavedJobs } from '../context/SavedJobsContext';
import { initials, isNewJob, jobPosted } from '../lib/format';
import { Icon } from './Icon';
import { Pill, SourceTag } from './ui';

export function JobCard({ job }: { job: Job }) {
  const { isSaved, toggleSave } = useSavedJobs();
  const saved = isSaved(job.id);
  const href = `/jobs/${job.id}`;

  return (
    <article className="job-card">
      <div className="tile tile-40" aria-hidden="true">{initials(job.company)}</div>
      <div className="job-card-body">
        <div className="job-card-title-row">
          <Link to={href} className="job-card-title">{job.title}</Link>
          {isNewJob(job) && <Pill tone="accent" size="xs">New</Pill>}
        </div>
        <div className="job-card-meta">
          <span className="company">{job.company}</span>
          <span className="meta-item"><Icon name="pin" size={14} />{job.location}</span>
          <span className="meta-item"><Icon name="briefcase" size={14} />{job.jobType}</span>
          <span className="meta-item"><Icon name="clock" size={14} />{jobPosted(job)}</span>
        </div>
      </div>
      <div className="job-card-actions">
        <SourceTag>{job.source}</SourceTag>
        <button
          type="button"
          className="btn btn-sm save-btn"
          aria-pressed={saved}
          aria-label={saved ? `Remove ${job.title} from saved` : `Save ${job.title}`}
          onClick={() => toggleSave(job.id)}
        >
          <Icon name="bookmark" size={14} filled={saved} />
          {saved ? 'Saved' : 'Save'}
        </button>
        <Link to={href} className="btn btn-sm btn-dark" style={{ padding: '0 12px' }}>
          View job<Icon name="arrowRight" size={14} strokeWidth={2} />
        </Link>
      </div>
    </article>
  );
}
