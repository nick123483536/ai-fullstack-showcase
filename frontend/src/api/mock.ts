// Sample data used when VITE_USE_MOCK=true, so the UI can run without the backend.
import { ApiError } from './client';
import type { CurrentUser, Job, JobSearchParams, Page } from './types';
import { POSTED_MINUTES } from '../lib/format';

const COMPANIES: [string, string][] = [
  ['Razorpay', 'Bangalore, India'], ['Zerodha', 'Bangalore, India'], ['Swiggy', 'Bangalore, India'], ['Freshworks', 'Chennai, India'],
  ['CRED', 'Bangalore, India'], ['Postman', 'Bangalore, India'], ['PhonePe', 'Pune, India'], ['Meesho', 'Bangalore, India'],
  ['Zoho', 'Chennai, India'], ['Groww', 'Bangalore, India'], ['BrowserStack', 'Mumbai, India'], ['Juspay', 'Bangalore, India'],
  ['Chargebee', 'Chennai, India'], ['Dream11', 'Mumbai, India'], ['Thoughtworks', 'Pune, India'], ['InMobi', 'Bangalore, India'],
  ['Atlassian', 'Remote, India'], ['Hasura', 'Remote, India'], ['Sarvam AI', 'Bangalore, India'], ['Microsoft', 'Hyderabad, India'],
  ['Uber', 'Hyderabad, India'], ['Paytm', 'Noida, India'],
];
const TITLES = [
  'Senior Backend Engineer', 'Full Stack Software Engineer', 'Senior Full Stack Engineer', 'Platform Engineer', 'Staff Software Engineer, Payments',
  'Frontend Engineer (React)', 'Site Reliability Engineer', 'Data Engineer', 'Machine Learning Engineer', 'Software Engineer II',
  'Java Developer (Spring Boot)', 'Engineering Manager, Backend', 'DevOps Engineer', 'Backend Engineer (Go)', 'Android Engineer',
  'Software Development Engineer Intern', 'Senior Data Scientist', 'Security Engineer', 'QA Automation Engineer', 'Product Engineer',
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

/** Formats a Date the way Spring serializes LocalDateTime (local time, no zone). */
function toLocalDateTime(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

// Remotive and Jobicy listings, shaped the way the backend's clients map them; the rest stand in for Adzuna.
const REMOTE_COMPANIES: [string, string][] = [
  ['GitLab', 'Worldwide'], ['Automattic', 'Worldwide'], ['Toptal', 'Asia'], ['Doist', 'Worldwide'], ['Deel', 'India'], ['Canonical', 'Worldwide'],
];

const NOW = Date.now();
const JOBS: Job[] = Array.from({ length: 50 }, (_, i) => {
  const title = TITLES[(i * 3 + 1) % TITLES.length];
  const minutes = Math.round(6 + i * 35 + i * i * 2.2);
  const id = 140 - i;
  const postedAt = toLocalDateTime(new Date(NOW - minutes * 60000));
  if (i % 6 === 5 || i % 6 === 2) {
    const [company, geo] = REMOTE_COMPANIES[Math.floor(i / 3) % REMOTE_COMPANIES.length];
    if (i % 6 === 2) {
      return {
        id, title, company, location: `Remote, ${geo}`, jobType: 'Full-Time', source: 'JOBICY',
        jobUrl: `https://jobicy.com/jobs/${id}-${slug(title)}`,
        postedAt,
      };
    }
    return {
      id, title, company, location: geo, jobType: 'REMOTE', source: 'REMOTIVE',
      jobUrl: `https://remotive.com/remote-jobs/software-dev/${slug(title)}-${id}`,
      postedAt,
    };
  }
  const [company, location] = COMPANIES[(i * 7 + 3) % COMPANIES.length];
  const jobType = /Intern/.test(title) ? 'Internship' : i % 9 === 4 ? 'Contract' : i % 13 === 7 ? 'Part Time' : 'Full Time';
  return {
    id, title, company, location, jobType,
    source: 'ADZUNA',
    jobUrl: `https://www.adzuna.in/details/${id}`,
    postedAt,
  };
});

const delay = <T>(value: T, ms = 450) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

export function fakeJwt(username: string) {
  const enc = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
  return `${enc({ alg: 'none' })}.${enc({ sub: username, exp: Math.floor(Date.now() / 1000) + 86400 })}.mock`;
}

export const mockApi = {
  login: (username: string) => delay({ token: fakeJwt(username) }, 600),
  register: () => delay(undefined, 700),
  // Sign in as a username starting with "user" to see the app as a normal user; anyone else is an admin.
  getCurrentUser: (username: string): Promise<CurrentUser> => delay({ username, role: /^user/i.test(username) ? 'USER' : 'ADMIN' }, 150),
  getAllJobs: () => delay([...JOBS]),
  getJob: (id: number) => {
    const job = JOBS.find((j) => j.id === id);
    return job ? delay(job, 250) : Promise.reject(new ApiError(404, 'Job not found'));
  },
  searchJobs: (p: JobSearchParams): Promise<Page<Job>> => {
    const has = (field: string, q: string) => !q || field.toLowerCase().includes(q.toLowerCase());
    const within = POSTED_MINUTES[p.postedWithin];
    const results = JOBS.filter((j) =>
      has(j.title, p.title.trim()) && has(j.location, p.location) && has(j.company, p.company) &&
      has(j.jobType, p.jobType) && (!p.source || j.source === p.source) &&
      (!within || (Date.now() - new Date(j.postedAt!).getTime()) / 60000 <= within));
    const start = p.page * p.size;
    return delay({
      content: results.slice(start, start + p.size),
      totalElements: results.length,
      totalPages: Math.max(1, Math.ceil(results.length / p.size)),
      number: p.page,
      size: p.size,
    }, 550);
  },
  ingestFromSource: () => delay(JOBS.slice(0, 50), 1500),
};
