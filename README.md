# AI Full Stack Showcase

A collection of full-stack projects demonstrating modern frontend development, backend engineering, API design, and database integration.

## Projects

### Job Intelligence

Job Intelligence is a job discovery application built with a React and TypeScript frontend and a Java Spring Boot backend. The project brings together a job-search interface, REST APIs, PostgreSQL persistence, and paginated search results.

**Project status:** Active development.

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- CSS
- npm

### Backend
- Java 17
- Spring Boot
- Spring Data JPA
- Hibernate
- Gradle
- REST APIs

### Database
- PostgreSQL

### Development Tools
- Git and GitHub
- Node.js and npm

## Features

### Job Search
- Search jobs using supported criteria, including title, location, company, and job type
- Paginated job search results
- Sort results by posting date
- View individual job details

### Frontend Application
- React and TypeScript component-based architecture
- Client-side routing
- Login and registration screens
- Protected frontend routes
- Job search and job details pages
- Saved jobs interface
- Dashboard and analytics pages
- Settings and source-management screens
- Typed API layer with error handling
- Mock-data mode for frontend development and demonstration

> **Authentication note:** The login and registration interfaces are part of the frontend. Working authentication against a backend is not documented as available in the current public version. Mock mode can be used to demonstrate the frontend independently.

### Backend
- REST API for job management
- Create, retrieve, update, and delete job listings
- Retrieve individual jobs by ID
- Search jobs using supported filters
- Pagination and sorting
- PostgreSQL persistence through Spring Data JPA and Hibernate
- Centralized exception handling

## Project Structure

```text
ai-fullstack-showcase/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/nikhil/jobintelligence/
│   │   │       ├── controller/
│   │   │       ├── entity/
│   │   │       ├── exception/
│   │   │       ├── repository/
│   │   │       ├── service/
│   │   │       └── specification/
│   │   └── resources/
│   └── test/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── styles/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.ts
│   └── README.md
├── build.gradle
├── settings.gradle
└── README.md
```

## API Endpoints

The backend exposes job-management and search endpoints.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API status |
| GET | `/api/jobs` | Retrieve jobs |
| GET | `/api/jobs/{id}` | Retrieve a job by ID |
| POST | `/api/jobs` | Create a job |
| PUT | `/api/jobs/{id}` | Update a job |
| DELETE | `/api/jobs/{id}` | Delete a job |
| GET | `/api/jobs/search` | Search jobs with supported filters, pagination, and sorting |

### Search Examples

Retrieve the first page with 10 results, sorted by posting date:

```http
GET /api/jobs/search?page=0&size=10&sort=postedAt,desc
```

Search using a location and pagination:

```http
GET /api/jobs/search?location=Kochi&page=0&size=10&sort=postedAt,desc
```

Combine supported search parameters as needed. Confirm exact parameter names and behavior against the current backend implementation.

## Prerequisites

- Java 17
- Node.js and npm
- PostgreSQL
- Git

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/nick123483536/ai-fullstack-showcase.git
cd ai-fullstack-showcase
```

### 2. Configure PostgreSQL

Create the database:

```sql
CREATE DATABASE job_intelligence;
```

Configure the database connection using the backend's local configuration.

Keep database credentials and other secrets out of version control.

### 3. Start the Backend

From the repository root, run the Gradle wrapper.

**Windows PowerShell:**

```powershell
.\gradlew.bat bootRun
```

**Linux/macOS:**

```bash
./gradlew bootRun
```

Ensure PostgreSQL is running and the backend database configuration is correct.

### 4. Start the Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Vite will print the local development URL in the terminal.

### 5. Configure the Frontend

Review `frontend/.env.example` for the supported frontend configuration options.

The frontend supports mock-data mode for development and demonstration. To use the live backend, configure the API connection and disable mock mode according to the example configuration.

## Build and Test

### Backend Tests

Run from the repository root:

```powershell
.\gradlew.bat test
```

### Frontend Production Build

Run from the frontend directory:

```powershell
npm run build
```

## Planned Improvements

The following features are not documented as implemented in the current public version and may be added as development continues:

- Backend authentication with JWT and password hashing
- Role-based API authorization
- Redis caching
- Docker Compose-based development environment
- Swagger/OpenAPI documentation
- Scheduled ingestion from external job sources
- Source-based and posting-freshness filters in the backend
- Additional automated tests and deployment improvements

## Project Goals

The goal of Job Intelligence is to evolve into a reliable job discovery platform with a maintainable frontend, a secure backend, efficient data access, and integrations with external job sources.
