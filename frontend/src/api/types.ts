/** Mirrors com.nikhil.jobintelligence.dto.JobResponse. */
export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  jobType: string;
  source: string;
  jobUrl: string;
  /** Spring LocalDateTime, serialized without a zone, e.g. "2026-10-03T09:15:00". */
  postedAt: string | null;
}

/** The subset of Spring Data's Page<T> JSON the UI relies on. */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  /** Zero-based page index. */
  number: number;
  size: number;
}

export type PostedWithin = '' | '1h' | '24h' | '3d' | '7d';

export interface JobFilters {
  title: string;
  location: string;
  company: string;
  jobType: string;
  source: string;
  postedWithin: PostedWithin;
}

export interface JobSearchParams extends JobFilters {
  /** Zero-based page index, as Spring's Pageable expects. */
  page: number;
  size: number;
}

export interface AuthResponse {
  token: string;
}
