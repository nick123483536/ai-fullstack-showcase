# AI Full Stack Showcase

A collection of full-stack and AI-powered projects built to demonstrate
modern software engineering skills.

## Projects

### Job Intelligence

A Spring Boot REST API for managing job listings, built as the backend
foundation for a future job intelligence platform.

### Tech Stack

- Java 17
- Spring Boot
- Spring Data JPA
- Hibernate
- PostgreSQL
- Gradle
- REST API

### Current Features

- Health check endpoint
- Create job
- Get all jobs
- Get job by ID
- Update job
- Delete job
- Global exception handling
- PostgreSQL persistence
- JPA/Hibernate entity mapping

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check API status |
| GET | `/api/jobs` | Get all jobs |
| GET | `/api/jobs/{id}` | Get job by ID |
| POST | `/api/jobs` | Create a job |
| PUT | `/api/jobs/{id}` | Update a job |
| DELETE | `/api/jobs/{id}` | Delete a job |

## Local Setup

### Requirements

- Java 17+
- PostgreSQL
- Git

### Database

Create a PostgreSQL database:

```sql
CREATE DATABASE job_intelligence;
