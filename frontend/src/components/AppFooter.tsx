import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { sourceCounts } from '../lib/format';

export function AppFooter({ onShortcuts }: { onShortcuts: () => void }) {
  const { jobs, jobsStatus } = useWorkspace();
  const { isAdmin } = useAuth();
  const delivering = sourceCounts(jobs).length;

  let health = <span className="health ok"><i />All sources healthy</span>;
  if (jobsStatus === 'error') health = <span className="health warn"><i />Can't reach the job service</span>;
  else if (jobsStatus === 'ready' && delivering === 0) health = <span className="health warn"><i />No source has delivered roles yet</span>;

  return (
    <footer className="app-footer">
      <span>© {new Date().getFullYear()} Job Intelligence</span>
      {health}
      <span>Adzuna hourly · Jobicy and Remotive 4 times a day</span>
      <span>
        Jobs by <a href="https://www.adzuna.in" target="_blank" rel="noopener noreferrer">Adzuna</a>,{' '}
        <a href="https://jobicy.com" target="_blank" rel="noopener noreferrer">Jobicy</a> and{' '}
        <a href="https://remotive.com" target="_blank" rel="noopener noreferrer">Remotive</a>
      </span>
      <span className="spacer" />
      <button type="button" onClick={onShortcuts}>Keyboard shortcuts</button>
      {isAdmin && <Link to="/sources">Sources</Link>}
      <Link to="/settings">Settings</Link>
    </footer>
  );
}
