import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildSearchQuery, searchJobs } from '../api';
import { errorMessage, isAbortError } from '../api/client';
import type { Job, JobFilters, JobSearchParams, Page, PostedWithin } from '../api/types';
import { Icon } from '../components/Icon';
import { JobTable, JobTableSkeleton } from '../components/JobCard';
import { EmptyBlock, ErrorLine, Select, type SelectOption } from '../components/ui';
import { usePreferences } from '../context/PreferencesContext';
import { MOBILE_MAX } from '../hooks/useWindowWidth';
import { useWorkspace } from '../context/WorkspaceContext';
import { city, DEFAULT_JOB_TYPES, isFreshJob, POSTED_OPTIONS, SOURCE_LABELS, typeLabel, uniqueSorted } from '../lib/format';

type FilterKey = Exclude<keyof JobFilters, 'title'>;

const FILTER_LABELS: Record<FilterKey, string> = {
  location: 'Location', company: 'Company', jobType: 'Job type', postedWithin: 'Posted', source: 'Source',
};


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
    const opt = (all: string, values: string[], label = (v: string) => v): SelectOption[] => [{ value: '', label: all }, ...values.map((v) => ({ value: v, label: label(v) }))];
    const types = uniqueSorted(allJobs.map((j) => j.jobType));
    return {
      location: opt('All locations', uniqueSorted(allJobs.map((j) => city(j.location)))),
      company: opt('All companies', uniqueSorted(allJobs.map((j) => j.company))),
      jobType: opt('All types', types.length ? types : DEFAULT_JOB_TYPES, typeLabel),
      source: opt('All sources', uniqueSorted(allJobs.map((j) => j.source)), (v) => SOURCE_LABELS[v] ?? v),
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

  const freshCount = allJobs.filter(isFreshJob).length;
  const resultsTitle = result.status === 'loading' && !page ? 'Loading roles…'
    : result.status === 'error' ? 'Roles'
      : `${total.toLocaleString('en-IN')} role${total === 1 ? '' : 's'}`;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Jobs</h1>
          <p className="page-desc">
            {allJobs.length
              ? <>Every role stored from your sources, newest first. <strong>{freshCount} posted in the last 24 hours.</strong></>
              : 'Every role stored from your sources, newest first.'}
          </p>
        </div>
      </div>

      <section aria-label="Search and filters" className="panel toolbar">
        <form role="search" className="toolbar-search" onSubmit={onSearch}>
          <div className="input-wrap">
            <Icon name="search" size={16} className="input-icon" />
            <input
              aria-label="Search jobs by title"
              className="input input-sm has-icon"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, e.g. backend engineer"
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
          <button
            type="button"
            className="btn btn-outline filters-toggle"
            aria-expanded={filtersOpen}
            aria-controls="ji-filters"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            <Icon name="filter" size={15} />Filters{activeFilterCount > 0 && <span className="num">· {activeFilterCount}</span>}
          </button>
        </form>

        <div id="ji-filters" className={`toolbar-filters${filtersOpen ? ' is-open' : ''}`}>
          {filterKeys.map((k) => (
            <Select
              key={k}
              id={`ji-f-${k}`}
              aria-label={FILTER_LABELS[k]}
              value={filters[k]}
              options={withCurrent(k)}
              highlight={!!filters[k]}
              onChange={(v) => updateParams({ [k]: v })}
            />
          ))}
          {chips.length > 0 && <button type="button" className="text-btn is-muted clear-all" onClick={clearAll}>Clear all</button>}
        </div>
      </section>

      <section aria-labelledby="ji-results" className="panel panel-clip">
        <div className="panel-head">
          <div>
            <h2 id="ji-results" className="panel-title" aria-live="polite">{resultsTitle}</h2>
            <div className="panel-sub">{chips.length ? chips.map((c) => c.label).join(' · ') : 'All roles, newest first'}</div>
          </div>
        </div>

        {showSkeleton && <JobTableSkeleton rows={6} />}

        {result.status === 'error' && (
          <ErrorLine message={`Couldn't load jobs. ${result.message}`} onRetry={() => setRetryKey((k) => k + 1)} />
        )}

        {page && visible.length === 0 && result.status === 'success' && (
          <EmptyBlock title="No roles match" action={<button type="button" className="btn" onClick={clearAll}>Clear filters</button>}>
            Nothing stored matches {chips.length ? 'these filters' : 'yet'}. Widen the search or clear a filter.
          </EmptyBlock>
        )}

        {page && visible.length > 0 && (
          <>
            <div style={{ opacity: result.status === 'loading' ? 0.6 : 1, transition: 'opacity .15s ease' }} aria-busy={result.status === 'loading'}>
              <JobTable jobs={visible} caption={resultsTitle} />
            </div>
            <nav aria-label="Pagination" className="panel-foot pagination">
              <span className="num">{start + 1}–{Math.min(start + perPage, total)} of {total.toLocaleString('en-IN')}</span>
              <div className="pager">
                <button type="button" className="icon-btn" disabled={pageNum <= 1} onClick={() => goToPage(pageNum - 1)} aria-label="Previous page">
                  <Icon name="chevLeft" size={16} />
                </button>
                {pageWindow(Math.min(pageNum, totalPages), totalPages).map((p, i) => p === null
                  ? <span key={`gap-${i}`} className="page-gap">…</span>
                  : (
                    <button
                      key={p}
                      type="button"
                      className="page-num num"
                      aria-current={p === pageNum ? 'page' : undefined}
                      aria-label={`Page ${p}`}
                      onClick={() => goToPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                <button type="button" className="icon-btn" disabled={pageNum >= totalPages} onClick={() => goToPage(pageNum + 1)} aria-label="Next page">
                  <Icon name="chevRight" size={16} />
                </button>
              </div>
            </nav>
          </>
        )}
      </section>
    </div>
  );
}
