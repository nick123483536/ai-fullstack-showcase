# AI Full Stack Showcase

A collection of full-stack projects demonstrating modern frontend development, backend engineering, API design, caching, containerization and, step by step, applied AI.

## Projects

### Job Intelligence

Job Intelligence is a job discovery application. It pulls fresh software roles from free public job APIs on a schedule, stores them in PostgreSQL and serves them through a secured Spring Boot API to a React and TypeScript dashboard. The whole stack runs with a single `docker compose up`.

**Project status:** Active development. Next up: Redis-based rate limiting and caching, then AI features (structured extraction, semantic search and RAG). See the [Roadmap](#roadmap).

## Tech Stack

### Frontend
- React 18 and TypeScript
- Vite
- React Router
- Hand-written CSS design system with light and dark themes
- nginx, which serves the production build and proxies the API

### Backend
- Java 17 and Spring Boot 4
- Spring Security with stateless JWT authentication and role-based authorization
- Spring Data JPA and Hibernate
- Spring Cache with Redis
- Scheduled ingestion from external job APIs
- springdoc OpenAPI (Swagger UI)
- Gradle

### Data and Infrastructure
- PostgreSQL 18 (the pgvector image, ready for vector search)
- Redis 7
- Docker with multi-stage builds
- Docker Compose

## Features

### Job Ingestion
- Pulls jobs from three free sources:
  - [Adzuna](https://developer.adzuna.com): India, needs a free API key, synced hourly
  - [Jobicy](https://jobicy.com/jobs-rss-feed): remote roles, synced four times a day
  - [Remotive](https://remotive.com): remote roles, synced four times a day
- Each source is isolated, so one failing API does not stop the others
- Incomplete listings are skipped, and posting times are normalized
- Admins can also trigger a sync on demand

### Search
- Filter by title, location, company, job type, source and posting freshness (`1h`, `24h`, `3d`, `7d`)
- Pagination and sorting

### Security
- Registration and login with BCrypt-hashed passwords and JWT access tokens
- Two roles: `USER` and `ADMIN`
- Reading jobs requires sign-in; creating, updating and deleting jobs, and running ingestion, require `ADMIN`
- Secrets come only from environment variables and are never committed

### Frontend Application
- Today dashboard with new-role counts, trends and a daily review goal
- Job list with filters, job details, saved jobs and analytics
- Ctrl+K command palette for search and navigation
- Role-aware navigation: source management and sync are shown to admins only
- Light and dark themes, a responsive layout, and motion that respects reduced-motion settings
- Mock-data mode for working on the UI without a backend

## Architecture

```text
Browser ──► nginx (localhost:3000)
              ├─ /api/*  ──► Spring Boot backend (backend:8081)
              │                 ├─ PostgreSQL + pgvector (postgres:5432)
              │                 ├─ Redis cache            (redis:6379)
              │                 └─ Adzuna / Jobicy / Remotive APIs
              └─ everything else ──► React build (static files)
```

The browser only talks to nginx, so there is no CORS setup. Inside Docker, services reach each other by service name.

## Quick Start with Docker (recommended)

Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/) and Git.

```bash
git clone https://github.com/nick123483536/ai-fullstack-showcase.git
cd ai-fullstack-showcase
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
```

Edit `.env` and set at least `JWT_SECRET`, a random string of 32 or more characters. Then:

```bash
docker compose up --build
```

| URL | What |
|---|---|
| http://localhost:3000 | The application |
| http://localhost:8081/swagger-ui.html | API documentation |

New accounts get the `USER` role. To make yourself an admin:

```bash
docker compose exec postgres psql -U postgres -d job_intelligence \
  -c "UPDATE users SET role='ADMIN' WHERE username='your-username';"
```

Then sign out and back in.

Useful commands:

```bash
docker compose ps                 # service status and health
docker compose logs -f backend    # follow backend logs
docker compose down               # stop (the database is kept in a volume)
docker compose down -v            # stop and delete the database volume
```

PostgreSQL and Redis are published on `127.0.0.1` only (ports `5433` and `6379`), so database tools on your machine can connect, but other devices on the network cannot.

## Configuration

All secrets come from environment variables. With Docker they are read from `.env`; see [`.env.example`](.env.example).

| Variable | Required | Purpose |
|---|---|---|
| `JWT_SECRET` | Yes | Signs JWTs. At least 32 characters |
| `POSTGRES_PASSWORD` | Yes (Docker) | Database password, used by both the database and the backend |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | No | Free Adzuna credentials. Leave empty to disable that source |
| `ADZUNA_WHAT` | No | Adzuna search keywords (default `software developer`) |

## Local Development without Docker

Useful for debugging in an IDE. You need Java 17, Node.js, PostgreSQL and Redis, either installed locally or as containers (`docker compose up postgres redis`).

**Backend**, from the repository root. Set `JWT_SECRET` and the other variables in your shell or IDE run configuration first. `application.properties` defaults to `localhost:5432`; when using the Compose database, set `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5433/job_intelligence`.

```powershell
.\gradlew.bat bootRun       # Linux/macOS: ./gradlew bootRun
```

**Frontend**, in a second terminal:

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173, proxies /api to localhost:8081
npm run dev:mock   # sample data, no backend needed
```

## API Endpoints

Full interactive documentation is available in Swagger UI at `/swagger-ui.html`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Sign in and receive a JWT |
| GET | `/api/auth/me` | Signed in | Current username and role |
| GET | `/api/health` | Signed in | API status |
| GET | `/api/jobs` | Signed in | All jobs (cached in Redis) |
| GET | `/api/jobs/{id}` | Signed in | A job by ID |
| GET | `/api/jobs/search` | Signed in | Filtered, paginated, sorted search |
| POST | `/api/jobs` | Admin | Create a job |
| PUT | `/api/jobs/{id}` | Admin | Update a job |
| DELETE | `/api/jobs/{id}` | Admin | Delete a job |
| GET | `/api/ingestion/source` | Admin | Sync all job sources now |
| POST | `/api/ingestion` | Admin | Ingest a single job |

Send the token as `Authorization: Bearer <token>`.

### Search Examples

```http
GET /api/jobs/search?page=0&size=10&sort=postedAt,desc
GET /api/jobs/search?location=Bangalore&postedWithin=24h&page=0&size=10
GET /api/jobs/search?title=java&source=ADZUNA&sort=postedAt,desc
```

## Project Structure

```text
ai-fullstack-showcase/
├── src/main/java/com/nikhil/jobintelligence/
│   ├── config/          # Security, Redis and OpenAPI configuration
│   ├── controller/      # REST controllers
│   ├── dto/             # Request and response objects
│   ├── entity/          # JPA entities
│   ├── exception/       # Centralized error handling
│   ├── ingestion/       # Job source clients and the scheduler
│   ├── repository/      # Spring Data repositories
│   ├── security/        # JWT filter
│   ├── service/         # Business logic
│   └── specification/   # Dynamic search queries
├── src/test/            # Unit and integration tests
├── frontend/
│   ├── src/             # api, components, context, hooks, lib, pages, styles
│   ├── Dockerfile       # Node build stage, then nginx
│   └── nginx.conf       # SPA routing and /api reverse proxy
├── Dockerfile           # Gradle/JDK build stage, then JRE runtime
├── docker-compose.yml   # postgres, redis, backend, frontend
├── .env.example
└── build.gradle
```

## Build and Test

```powershell
.\gradlew.bat test          # backend tests (Linux/macOS: ./gradlew test)
cd frontend; npm run build  # type-check and production build
```

## Roadmap

- [x] JWT authentication and role-based authorization
- [x] Scheduled ingestion from free job APIs
- [x] Redis caching
- [x] Dockerized stack with Docker Compose
- [x] Swagger/OpenAPI documentation
- [ ] Redis: per-search caching, login rate limiting, ingestion de-duplication, trending companies, live "new jobs" notifications
- [ ] AI: extract skills, seniority and salary from job descriptions with a local LLM
- [ ] Semantic and hybrid search with embeddings in pgvector
- [ ] RAG: ask questions about current openings, and match jobs against a resume
- [ ] CI pipeline that builds and publishes Docker images

## Data Sources and Attribution

Job listings come from the public APIs of [Adzuna](https://www.adzuna.in), [Jobicy](https://jobicy.com) and [Remotive](https://remotive.com). Each listing links back to its original posting, and all rights to listing content remain with those providers.
