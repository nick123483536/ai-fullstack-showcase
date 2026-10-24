import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { ReviewedProvider } from '../context/ReviewedContext';
import { SavedJobsProvider } from '../context/SavedJobsContext';
import { WorkspaceProvider } from '../context/WorkspaceContext';

/** Signed-in area. Per-user providers are keyed by username so they reload on account switch. */
export function RequireAuth() {
  const { token, username } = useAuth();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return (
    <PreferencesProvider key={`prefs-${username}`}>
      <SavedJobsProvider key={`saved-${username}`}>
        <ReviewedProvider key={`reviewed-${username}`}>
          <WorkspaceProvider>
            <Outlet />
          </WorkspaceProvider>
        </ReviewedProvider>
      </SavedJobsProvider>
    </PreferencesProvider>
  );
}

/** Admin-only screens. Normal users are sent to Today; the backend still refuses their API calls either way. */
export function RequireAdmin() {
  const { role } = useAuth();
  if (role === null) return null;
  return role === 'ADMIN' ? <Outlet /> : <Navigate to="/" replace />;
}

export function PublicOnly() {
  const { token } = useAuth();
  const location = useLocation();
  if (token) {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from && from !== '/login' ? from : '/'} replace />;
  }
  return <Outlet />;
}
