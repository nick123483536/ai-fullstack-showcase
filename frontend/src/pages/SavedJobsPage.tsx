import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../api/types';
import { JobCard } from '../components/JobCard';
import { EmptyState, ErrorState, JobListSkeleton } from '../components/ui';
import { usePreferences } from '../context/PreferencesContext';
import { useSavedJobs } from '../context/SavedJobsContext';
import { useWorkspace } from '../context/WorkspaceContext';

type Tab = 'all' | 'recent' | 'applied';

export function SavedJobsPage() {
  const [tab, setTab] = useState<Tab>('all');
  const { savedIds } = useSavedJobs();
  const { jobsUrl } = usePreferences();
  const { jobs, jobsStatus, jobsError, reloadJobs } = useWorkspace();

  const byId = new Map(jobs.map((j) => [j.id, j]));
  // Saved ids whose jobs no longer exist in the database are skipped.
  const savedJobs = savedIds.map((id) => byId.get(id)).filter((j): j is Job => !!j);
  const list = tab === 'recent' ? [...savedJobs].reverse() : savedJobs;

  const tabs: { id: Tab; label: string; count: string | number }[] = [
    { id: 'all', label: 'All', count: savedJobs.length },
    { id: 'recent', label: 'Recently saved', count: savedJobs.length },
    { id: 'applied', label: 'Applied', count: 'Soon' },
  ];

  let body;
  if (tab === 'applied') {
    body = (
      <EmptyState icon="check" title="Application tracking is coming soon">
        You'll be able to mark saved roles as applied and follow their status here.
      </EmptyState>
    );
  } else if (jobsStatus === 'loading' && jobs.length === 0) {
    body = <JobListSkeleton rows={Math.min(Math.max(savedIds.length, 1), 5)} />;
  } else if (jobsStatus === 'error') {
    body = <ErrorState title="Unable to load saved jobs." message={jobsError} onRetry={reloadJobs} />;
  } else if (list.length === 0) {
    body = (
      <EmptyState icon="bookmark" title="No saved jobs yet" action={<Link to={jobsUrl} className="btn btn-md btn-primary">Browse jobs</Link>}>
        Bookmark roles from search to keep them here.
      </EmptyState>
    );
  } else {
    body = <div className="job-list">{list.map((job) => <JobCard key={job.id} job={job} />)}</div>;
  }

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Saved Jobs</h1>
        <p className="page-desc">Roles you've bookmarked. Stored on this device until saved-jobs sync is available.</p>
      </div>
      <div role="tablist" aria-label="Saved jobs views" className="tabs">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" className="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}<span className="tab-count">{t.count}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel">{body}</div>
    </div>
  );
}
