import { Link } from 'react-router-dom';
import type { Job } from '../api/types';
import { JobTable, JobTableSkeleton } from '../components/JobCard';
import { EmptyBlock, ErrorLine } from '../components/ui';
import { usePreferences } from '../context/PreferencesContext';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { isFreshJob, sortByPostedDesc } from '../lib/format';

export function SavedJobsPage() {
  const { savedIds } = useSavedJobs();
  const { jobsUrl } = usePreferences();
  const { jobs, jobsStatus, jobsError, reloadJobs } = useWorkspace();

  const byId = new Map(jobs.map((j) => [j.id, j]));
  // Most recently saved first. Saved ids whose jobs no longer exist in the database are skipped.
  const saved = [...savedIds].reverse().map((id) => byId.get(id)).filter((j): j is Job => !!j);
  const fresh = saved.filter(isFreshJob).length;
  const loading = jobsStatus === 'loading' && jobs.length === 0;
  const suggestions = saved.length === 0 ? sortByPostedDesc(jobs).slice(0, 5) : [];

  const desc = saved.length === 0
    ? 'Roles you bookmark are kept here, on this device.'
    : `${saved.length} role${saved.length === 1 ? '' : 's'} kept on this device${fresh ? `, ${fresh} posted in the last 24 hours` : ''}. Apply while they're open.`;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Saved</h1>
          <p className="page-desc">{desc}</p>
        </div>
      </div>

      <section aria-labelledby="ji-saved-list" className="panel panel-clip">
        <div className="panel-head">
          <div>
            <h2 id="ji-saved-list" className="panel-title">Saved roles</h2>
            <div className="panel-sub">Most recently saved first</div>
          </div>
        </div>
        {loading && <JobTableSkeleton rows={Math.min(Math.max(savedIds.length, 2), 6)} />}
        {jobsStatus === 'error' && <ErrorLine message={`Couldn't load your saved roles. ${jobsError}`} onRetry={reloadJobs} />}
        {!loading && jobsStatus !== 'error' && saved.length === 0 && (
          <>
            <EmptyBlock title="Nothing saved yet" action={<Link to={jobsUrl} className="btn btn-primary">Browse jobs</Link>}>
              Use the bookmark on any role to keep it here until you apply. These are the freshest to start with.
            </EmptyBlock>
            {suggestions.length > 0 && (
              <>
                <div className="subhead"><h3>Newest roles</h3></div>
                <JobTable jobs={suggestions} caption="Newest roles you could save" />
              </>
            )}
          </>
        )}
        {saved.length > 0 && <JobTable jobs={saved} caption="Saved roles" />}
      </section>
    </div>
  );
}
