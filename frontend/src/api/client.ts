const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

/** Called when an authenticated request comes back 401 (expired or invalid token). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Attach the bearer token. Defaults to true. */
  auth?: boolean;
  signal?: AbortSignal;
}

function parseBody(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function defaultMessage(status: number) {
  if (status === 401) return 'Your session has expired. Sign in again.';
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return 'Not found.';
  if (status >= 500) return 'The server ran into a problem. Try again in a moment.';
  return `Request failed (${status}).`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;

  let res: Response;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(0, "Can't reach the Job Intelligence API. Is the backend running?");
  }

  const data = parseBody(await res.text());

  if (!res.ok) {
    if (res.status === 401 && auth) unauthorizedHandler?.();
    let message = defaultMessage(res.status);
    let fieldErrors: Record<string, string> | undefined;
    if (data && typeof data === 'object') {
      const err = data as { message?: unknown; errors?: unknown };
      if (typeof err.message === 'string' && err.message) message = err.message;
      if (err.errors && typeof err.errors === 'object') fieldErrors = err.errors as Record<string, string>;
    } else if (typeof data === 'string' && data.length < 200) {
      message = data;
    }
    throw new ApiError(res.status, message, fieldErrors);
  }

  return data as T;
}

export function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === 'AbortError';
}

export function errorMessage(err: unknown) {
  return err instanceof Error ? err.message : 'Something went wrong.';
}
