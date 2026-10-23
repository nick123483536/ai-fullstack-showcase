import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildSearchQuery, searchJobs } from '../api';
import { errorMessage, isAbortError } from '../api/client';
import type { Job, JobFilters, JobSearchParams, Page, PostedWithin } from '../api/types';
import { Icon } from '../components/Icon';
import { JobCard } from '../components/JobCard';
import { EmptyState, ErrorState, JobListSkeleton, Select, type SelectOption } from '../components/ui';
import { usePreferences } from '../context/PreferencesContext';
import { MOBILE_MAX } from '../hooks/useWindowWidth';
import { useWorkspace } from '../context/WorkspaceContext';
import { city, DEFAULT_JOB_TYPES, POSTED_OPTIONS, uniqueSorted } from '../lib/format';

type FilterKey = Exclude<keyof JobFilters, 'title'>;

const FILTER_LABELS: Record<FilterKey, string> = {
  location: 'Location', company: 'Company', jobType: 'Job type', source: 'Source', postedWithin: 'Posted',
};

const SOURCE_OPTIONS: SelectOption[] = [
  { value: '', label: 'All sources' },
  { value: 'INDIAN_API', label: 'IndianAPI' },
  { value: 'LINKEDIN', label: 'LinkedIn (coming soon)', disabled: true },
  { value: 'INDEED', label: 'Indeed (coming soon)', disabled: true },
];

function readFilters(params: URLSearchParams): JobFilters {
  const posted = params.get('postedWithin') ?? '';
  return {
    title: params.get('title') ?? '',
    location: params.get('location') ?? '',
    company: params.get('company') ?? '',
    jobType: params.get('jobType') ?? '',
    source: params.get('source') ?? '',
    postedWithin: (POSTED_OPTIONS.some((o) => o.value === posted) ? posted : '') as PostedWithin,
  };
}

type Result =
  | { status: 'loading'; page?: Page<Job> }
  | { status: 'success'; page: Page<Job> }
  | { status: 'error'; message: string };

/** Page numbers to show, with null for a gap: 1 … 4 5 6 … 12 */
function pageWindow(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(null);
    out.push(p);
  });
  return out;
}

export function JobsPage() {
  const [params, setParams] = useSearchParams();
  const { prefs } = usePreferences();
  const { jobs: allJobs } = useWorkspace();
  const paramsKey = params.toString();
  // Keyed on the query string so the filters object is stable between renders.
  const filters = useMemo(() => readFilters(new URLSearchParams(paramsKey)), [paramsKey]);
  const pageNum = Math.max(1, Number(params.get('page')) || 1);
  const perPage = prefs.perPage;

  const [query, setQuery] = useState(filters.title);
  const [filtersOpen, setFiltersOpen] = useState(() => window.innerWidth > MOBILE_MAX);
  const [result, setResult] = useState<Result>({ status: 'loading' });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => setQuery(filters.title), [filters.title]);

  const request: JobSearchParams = { ...filters, page: pageNum - 1, size: perPage };
  const requestKey = buildSearchQuery(request);

  useEffect(() => {
    const ctrl = new AbortController();
    setResult((r) => ({ status: 'loading', page: r.status === 'success' ? r.page : undefined }));
    searchJobs(request, ctrl.signal)
      .then((page) => setResult({ status: 'success', page }))
      .catch((err) => {
        if (!isAbortError(err)) setResult({ status: 'error', message: errorMessage(err) });
      });
    return () => ctrl.abort();
  }, [requestKey, retryKey]);

  const updateParams = (patch: Partial<Record<keyof JobFilters | 'page', string>>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };

  const goToPage = (p: number) => {
    updateParams({ page: p > 1 ? String(p) : '' });
    window.scrollTo(0, 0);
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    updateParams({ title: query.trim() });
  };

  const clearAll = () => {
    setQuery('');
    setParams(new URLSearchParams());
  };

  // Filter options come from the full job set so they match what's actually stored.
  const options = useMemo(() => {
    const opt = (all: string, values: string[]): SelectOption[] => [{ value: '', label: all }, ...values.map((v) => ({ value: v, label: v }))];
    const types = uniqueSorted(allJobs.map((j) => j.jobType));
    return {
      location: opt('All locations', uniqueSorted(allJobs.map((j) => city(j.location)))),
      company: opt('All companies', uniqueSorted(allJobs.map((j) => j.company))),
      jobType: opt('All types', types.length ? types : DEFAULT_JOB_TYPES),
      source: SOURCE_OPTIONS,
      postedWithin: POSTED_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
    } satisfies Record<FilterKey, SelectOption[]>;
  }, [allJobs]);

  // Keep a current value selectable even if it isn't in the stored job set (e.g. from a shared URL).
  const withCurrent = (key: FilterKey) => {
    const v = filters[key];
    const list = options[key];
    return v && !list.some((o) => o.value === v) ? [...list, { value: v, label: v }] : list;
  };

  const filterKeys = Object.keys(FILTER_LABELS) as FilterKey[];
  const activeFilterCount = filterKeys.filter((k) => filters[k]).length;
  const chips = [
    ...(filters.title ? [{ key: 'title' as const, label: `Keyword: ${filters.title}` }] : []),
    ...filterKeys.filter((k) => filters[k]).map((k) => ({
      key: k,
      label: `${FILTER_LABELS[k]}: ${k === 'postedWithin'
        ? POSTED_OPTIONS.find((o) => o.value === filters.postedWithin)?.label
        : options[k].find((o) => o.value === filters[k])?.label ?? filters[k]}`,
    })),
  ];

  // The search endpoint has no source parameter; every stored job comes from one source, so filter client-side.
  const page = result.status === 'error' ? undefined : result.page;
  const visible = page ? page.content.filter((j) => !filters.source || j.source === filters.source) : [];
  const total = page?.totalElements ?? 0;
  const totalPages = Math.max(1, page?.totalPages ?? 1);
  const start = (page?.number ?? 0) * perPage;
  const showSkeleton = result.status === 'loading' && !page;

  const resultsTitle = result.status === 'loading' ? 'Loading jobs…'
    : result.status === 'error' ? 'Jobs'
      : `${total.toLocaleString('en-IN')} job${total === 1 ? '' : 's'}`;

  return (
    <div className="page">
      <div>
        <h1 className="page-title">Jobs</h1>
        <p className="page-desc">Discover and analyze opportunities from multiple sources.</p>
      </div>

      <section aria-label="Search and filters" className="card">
        <form role="search" className="search-form" onSubmit={onSearch}>
          <div className="input-wrap">
            <Icon name="search" size={17} className="input-icon" />
            <input
              aria-label="Search jobs by title"
              className="input has-icon"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs by title, e.g. backend engineer"
            />
          </div>
          <button
            type="button"
            className="btn btn-lg filters-btn"
            aria-expanded={filtersOpen}
            aria-controls="ji-filters"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <Icon name="filter" size={15} />Filters
            {activeFilterCount > 0 && <span className="count-dot">{activeFilterCount}</span>}
          </button>
          <button type="submit" className="btn btn-lg btn-primary" style={{ padding: '0 18px' }}>Search</button>
        </form>

        {filtersOpen && (
          <div id="ji-filters" className="filters-grid">
            {filterKeys.map((k) => (
              <div key={k} className="field">
                <label htmlFor={`ji-f-${k}`} className="field-label-sm">{k === 'postedWithin' ? 'Posted within' : FILTER_LABELS[k]}</label>
                <Select
                  id={`ji-f-${k}`}
                  value={filters[k]}
                  options={withCurrent(k)}
                  highlight={!!filters[k]}
                  onChange={(v) => updateParams({ [k]: v })}
                />
              </div>
            ))}
          </div>
        )}

        {chips.length > 0 && (
          <div className="chips">
            {chips.map((c) => (
              <span key={c.key} className="chip">
                {c.label}
                <button type="button" aria-label={`Remove ${c.key === 'title' ? 'keyword' : FILTER_LABELS[c.key]} filter`} onClick={() => {
                  if (c.key === 'title') setQuery('');
                  updateParams({ [c.key]: '' });
                }}>
                  <Icon name="x" size={12} strokeWidth={2.25} />
                </button>
              </span>
            ))}
            <button type="button" className="clear-all" onClick={clearAll}>Clear all</button>
          </div>
        )}
      </section>

      <div className="results-bar">
        <div className="results-title" aria-live="polite">{resultsTitle}</div>
        <code className="code-chip" title="Request this view maps to">GET /api/jobs/search?{requestKey}</code>
      </div>

      {showSkeleton && <JobListSkeleton />}

      {result.status === 'error' && (
        <ErrorState title="Unable to load jobs." message={result.message} onRetry={() => setRetryKey((k) => k + 1)} />
      )}

      {page && visible.length === 0 && result.status === 'success' && (
        <EmptyState
          icon="search"
          title="No jobs found"
          action={<button type="button" className="btn btn-md" onClick={clearAll}>Clear filters</button>}
        >
          Try changing your search or filters.
        </EmptyState>
      )}

      {page && visible.length > 0 && (
        <>
          <div className="job-list" style={{ opacity: result.status === 'loading' ? 0.6 : 1, transition: 'opacity .15s ease' }} aria-busy={result.status === 'loading'}>
            {visible.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
          <nav aria-label="Pagination" className="pagination">
            <span className="pagination-info">
              Showing <strong>{start + 1}–{Math.min(start + perPage, total)}</strong> of <strong>{total.toLocaleString('en-IN')}</strong> jobs
            </span>
            <div className="pager">
              <button type="button" className="btn btn-sm" disabled={pageNum <= 1} onClick={() => goToPage(pageNum - 1)} aria-label="Previous page">
                <Icon name="chevLeft" size={14} strokeWidth={2} />Prev
              </button>
              {pageWindow(Math.min(pageNum, totalPages), totalPages).map((p, i) => p === null
                ? <span key={`gap-${i}`} className="page-gap">…</span>
                : (
                  <button
                    key={p}
                    type="button"
                    className="page-num"
                    aria-current={p === pageNum ? 'page' : undefined}
                    aria-label={`Page ${p}`}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                ))}
              <button type="button" className="btn btn-sm" disabled={pageNum >= totalPages} onClick={() => goToPage(pageNum + 1)} aria-label="Next page">
                Next<Icon name="chevRight" size={14} strokeWidth={2} />
              </button>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
