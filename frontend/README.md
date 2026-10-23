# Job Intelligence — Frontend

React + TypeScript (Vite) frontend for the `jobIntelligence` Spring Boot API.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173, proxies /api → http://localhost:8081
npm run dev:mock   # same UI against built-in sample data, no backend needed
npm run build      # type-check + production build into dist/
```

Start the backend first for `npm run dev` (PostgreSQL + Redis, `server.port=8081`).
Register an account on the sign-up screen, then sign in.

## Configuration

Copy `.env.example` to `.env` to override:

| Variable | Purpose |
| --- | --- |
| `VITE_PROXY_TARGET` | Backend the dev server proxies `/api` to (default `http://localhost:8081`). |
| `VITE_API_BASE_URL` | API origin for production builds served separately from the backend. Requires CORS on the backend. |
| `VITE_USE_MOCK` | `true` to use sample data instead of the API. |

## API usage

| Screen | Endpoint |
| --- | --- |
| Sign in / Create account | `POST /api/auth/login`, `POST /api/auth/register` |
| Dashboard, Analytics, filter options, Saved | `GET /api/jobs` |
| Jobs search | `GET /api/jobs/search?title&location&company&jobType&postedWithin&page&size&sort=postedAt,desc` |
| Job details | `GET /api/jobs/{id}` |
| Run ingestion / Run sync | `GET /api/ingestion/source` |

The JWT from login is sent as `Authorization: Bearer …`. A 401 on any request signs the user out.

## Stored in the browser (no API yet)

- Saved jobs, profile (display name, role) and search preferences — per user, in `localStorage`.
- Ingestion run history — runs started from this browser only.
- Theme.

Password change and notification delivery are shown as "coming soon".
The Source filter is applied client-side because `/api/jobs/search` has no `source` parameter.

## Structure

```
src/
  api/          fetch client, endpoint functions, types, mock data
  context/      auth, theme, toasts, preferences, saved jobs, workspace (jobs + ingestion)
  components/   app shell (sidebar, top bar), JobCard, sync modal, shared UI
  pages/        one file per screen
  lib/          formatting helpers, storage
  styles/       design tokens + component styles (light/dark)
```
