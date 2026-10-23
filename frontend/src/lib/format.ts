import type { Job, PostedWithin } from '../api/types';

export const POSTED_OPTIONS: { value: PostedWithin; label: string }[] = [
  { value: '', label: 'Any time' },
  { value: '1h', label: 'Last 1 hour' },
  { value: '24h', label: 'Last 24 hours' },
  { value: '3d', label: 'Last 3 days' },
  { value: '7d', label: 'Last 7 days' },
];

export const POSTED_MINUTES: Record<PostedWithin, number | undefined> = {
  '': undefined, '1h': 60, '24h': 1440, '3d': 4320, '7d': 10080,
};

export const DEFAULT_JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship'];

export const SOURCE_LABELS: Record<string, string> = {
  INDIAN_API: 'IndianAPI',
  LINKEDIN: 'LinkedIn',
  INDEED: 'Indeed',
  NAUKRI: 'Naukri',
  REMOTIVE: 'Remotive',
};

export const sourceLabel = (key: string) => SOURCE_LABELS[key] ?? key;

/** Spring sends LocalDateTime without a zone; the ES spec parses that as local time. */
export function postedTime(job: Job): number | null {
  if (!job.postedAt) return null;
  const t = new Date(job.postedAt).getTime();
  return Number.isNaN(t) ? null : t;
}

export function minutesSince(t: number) {
  return Math.max(0, Math.round((Date.now() - t) / 60000));
}

export function jobMinutes(job: Job): number | null {
  const t = postedTime(job);
  return t === null ? null : minutesSince(t);
}

export function relativeTime(m: number | null) {
  if (m === null) return 'Unknown';
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.floor(m / 60)} hour${m < 120 ? '' : 's'} ago`;
  return `${Math.floor(m / 1440)} day${m < 2880 ? '' : 's'} ago`;
}

export const jobPosted = (job: Job) => relativeTime(jobMinutes(job));

/** Posted in the last 3 hours. */
export function isNewJob(job: Job) {
  const m = jobMinutes(job);
  return m !== null && m < 180;
}

export function formatDateTime(t: number) {
  return new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  return (words.length > 1 ? words[0][0] + words[1][0] : words[0][0]).toUpperCase();
}

export const city = (location: string) => location.split(',')[0].trim();

export function uniqueSorted(values: string[]) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

/** Counts by key, most frequent first. */
export function countBy<T>(items: T[], key: (item: T) => string): [string, number][] {
  const m = new Map<string, number>();
  items.forEach((item) => {
    const k = key(item);
    m.set(k, (m.get(k) ?? 0) + 1);
  });
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

export function sortByPostedDesc(jobs: Job[]) {
  return [...jobs].sort((a, b) => (postedTime(b) ?? 0) - (postedTime(a) ?? 0));
}

export function formatDuration(ms: number) {
  return `${(ms / 1000).toFixed(1)}s`;
}
