import { apiRequest, ApiError, USE_MOCK } from './client';
import { mockApi } from './mock';
import type { AuthResponse, CurrentUser, Job, JobSearchParams, Page } from './types';

/** Query string for GET /api/jobs/search. Exported so the Jobs page can show the request it maps to. */
export function buildSearchQuery(p: JobSearchParams) {
  const q = new URLSearchParams();
(['title', 'location', 'company', 'jobType', 'postedWithin', 'source'] as const).forEach((k) => {    const v = p[k].trim();
    if (v) q.set(k, v);
  });
  q.set('page', String(p.page));
  q.set('size', String(p.size));
  q.set('sort', 'postedAt,desc');
  return q.toString();
}

export async function login(username: string, password: string): Promise<string> {
  if (USE_MOCK) return (await mockApi.login(username)).token;
  try {
    const res = await apiRequest<AuthResponse>('/api/auth/login', { method: 'POST', body: { username, password }, auth: false });
    return res.token;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      throw new ApiError(err.status, 'Invalid username or password.');
    }
    throw err;
  }
}

export async function register(username: string, password: string): Promise<void> {
  if (USE_MOCK) return mockApi.register();
  try {
    await apiRequest<string>('/api/auth/register', { method: 'POST', body: { username, password }, auth: false });
  } catch (err) {
    // Surface the first field-level validation message from ErrorResponse.errors, if any.
    if (err instanceof ApiError && err.fieldErrors) {
      const first = Object.values(err.fieldErrors)[0];
      if (first) throw new ApiError(err.status, first, err.fieldErrors);
    }
    throw err;
  }
}

/** The signed-in user and their role; the backend reads the role from the database on every request. */
export function getCurrentUser(username: string, signal?: AbortSignal): Promise<CurrentUser> {
  if (USE_MOCK) return mockApi.getCurrentUser(username);
  // Only decides what the menu shows, so a failure (an older backend without /me) falls back to the normal-user view instead of signing out.
  return apiRequest<CurrentUser>('/api/auth/me', { signal, signOutOn401: false });
}

export function getAllJobs(signal?: AbortSignal): Promise<Job[]> {
  if (USE_MOCK) return mockApi.getAllJobs();
  return apiRequest<Job[]>('/api/jobs', { signal });
}

export function getJob(id: number, signal?: AbortSignal): Promise<Job> {
  if (USE_MOCK) return mockApi.getJob(id);
  return apiRequest<Job>(`/api/jobs/${id}`, { signal });
}

export function searchJobs(params: JobSearchParams, signal?: AbortSignal): Promise<Page<Job>> {
  if (USE_MOCK) return mockApi.searchJobs(params);
  return apiRequest<Page<Job>>(`/api/jobs/search?${buildSearchQuery(params)}`, { signal });
}

/** Pulls the latest listings from every connected source into the database. Returns the jobs ingested. */
export function ingestFromSource(): Promise<Job[]> {
  if (USE_MOCK) return mockApi.ingestFromSource();
  return apiRequest<Job[]>('/api/ingestion/source');
}
