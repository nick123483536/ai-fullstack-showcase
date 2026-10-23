# AI Full Stack Showcase

A collection of full-stack and AI-powered projects demonstrating modern software engineering, backend development, frontend architecture, and application security.

## Projects

### Job Intelligence

Job Intelligence is a full-stack job discovery platform built with a React and TypeScript frontend and a Java Spring Boot backend. It provides job management, search and filtering, pagination, sorting, authentication, and scheduled ingestion from external job sources.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS
- npm

### Backend
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- Gradle
- REST APIs
- JWT authentication

### Database and Caching
- PostgreSQL
- Redis
- Spring Data JPA and Hibernate for persistence
- Redis caching for frequently accessed data

### Development and API Documentation
- Docker and Docker Compose for containerized development dependencies
- Swagger UI / OpenAPI
- Git and GitHub

## Features

### 1. Job Management
- Create, retrieve, update, and delete job listings
- Retrieve individual jobs by ID
- PostgreSQL-backed persistence
- Global exception handling

### 2. Job Search and Discovery
- Search jobs using supported search criteria
- Filter by title, location, company, and job type
- Filter by job source
- Filter by posting freshness:
  - Last 1 hour
  - Last 24 hours
  - Last 3 days
  - Last 7 days
- Paginated search results
- Newest-first sorting by posting date
- Job cards with company, location, job type, source, and posting-age information

### 3. Job Ingestion
- Scheduled job ingestion
- Remotive API integration for remote job listings
- IndianAPI integration, subject to API quota and rate limits
- Existing-job checks using job URLs to help prevent duplicate records

### 4. Authentication and Security
- User registration and login
- JWT-based authentication
- Spring Security integration
- Password hashing with BCrypt
- Role-based authorization, according to configured security rules

### 5. Performance
- Redis caching
- Cache expiration and eviction
- PostgreSQL persistence
- Paginated data retrieval

### 6. Frontend Experience
- React and TypeScript application
- Login and registration screens
- Job search and details pages
- Saved jobs
- Dashboard and analytics views
- Settings and source-management screens
- Configurable API and mock-data modes

### 7. API Documentation and Error Handling
- Swagger UI / OpenAPI documentation
- Health-check endpoint
- Centralized exception handling

## Project Structure

```text
ai-fullstack-showcase/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/nikhil/jobintelligence/
│   │   │       ├── config/
│   │   │       ├── controller/
│   │   │       ├── dto/
│   │   │       ├── entity/
│   │   │       ├── exception/
│   │   │       ├── ingestion/
│   │   │       ├── repository/
│   │   │       ├── security/
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
│   └── vite.config.ts
├── build.gradle
├── settings.gradle
└── README.md
```

## API Endpoints

The following table covers the core job management and search endpoints.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API status |
| GET | `/api/jobs` | Retrieve jobs |
| GET | `/api/jobs/{id}` | Retrieve a job by ID |
| POST | `/api/jobs` | Create a job |
| PUT | `/api/jobs/{id}` | Update a job |
| DELETE | `/api/jobs/{id}` | Delete a job |
| GET | `/api/jobs/search` | Search and filter jobs |

Authentication endpoints and other API routes depend on the current controller configuration. Use Swagger UI to inspect the complete API.

### Search Examples

Retrieve the first page with 10 results, sorted by posting date:

```http
GET /api/jobs/search?page=0&size=10&sort=postedAt,desc
```

Filter by source:

```http
GET /api/jobs/search?source=INDIAN_API&page=0&size=10&sort=postedAt,desc
```

Retrieve jobs posted within the last seven days:

```http
GET /api/jobs/search?postedWithin=7d&page=0&size=10&sort=postedAt,desc
```

Combine supported filters:

```http
GET /api/jobs/search?location=Kochi&postedWithin=7d&page=0&size=10&sort=postedAt,desc
```

Check Swagger UI for the complete set of parameters and supported values.

## Prerequisites

- Java 17 or a compatible supported JDK
- Node.js and npm
- PostgreSQL
- Docker Desktop, if using the Docker-based Redis setup
- Git

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/nick123483536/ai-fullstack-showcase.git
cd ai-fullstack-showcase
```

### 2. Configure PostgreSQL

Create the application database:

```sql
CREATE DATABASE job_intelligence;
```

Configure the database connection using the application's existing configuration or environment variables.

Keep database credentials and other secrets out of version control.

### 3. Start Redis

If your Docker Compose configuration defines the Redis service, start it from the directory containing the Compose file:

```bash
docker compose up -d
```

Check the Compose configuration for the actual service names and ports. Start PostgreSQL separately if it is not included in that configuration.

### 4. Start the Backend

From the repository root, run the Gradle wrapper.

**Windows PowerShell:**

```powershell
.\gradlew.bat bootRun
```

**Linux/macOS:**

```bash
./gradlew bootRun
```

Make sure PostgreSQL, Redis, and the required application configuration are available.

### 5. Start the Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The Vite development server will display its local URL in the terminal.

The frontend includes a `.env.example` file for its configuration. Review it and configure the API URL and other
