# Backend — Real Estate Due Diligence Agent

Spring Boot backend for the Autonomous Property Research and Real Estate Risk Assessment Intelligence System (Infosys Springboard Internship — Team Two).

## Tech Stack

- Java 21
- Spring Boot 4.1.1
- Spring Web (REST APIs)
- Spring Data JPA (Hibernate)
- Spring Security (JWT / OAuth2)
- PostgreSQL
- Redis (caching)
- Lombok
- Maven

## Package Structure

```
com.realestate.duediligence
├── config        → App-wide configuration (CORS, Swagger, etc.)
├── controller     → REST API endpoints
├── service         → Business logic
├── repository     → Database access (JPA repositories)
├── entity         → JPA entities (map to DB tables)
├── dto             → Request/response objects
├── exception       → Custom exceptions + global error handling
└── security        → JWT authentication & Spring Security config
```

## Prerequisites

- Java 21 installed
- Maven
- PostgreSQL running locally (or update credentials in `application.properties`)
- Eclipse (or any Java IDE)

## Getting Started

1. Clone the repo and checkout the `team-two` branch.
2. Open this `backend/` folder in Eclipse as an existing Maven project.
3. Create a local PostgreSQL database, e.g. `duediligence_db`.
4. Update `src/main/resources/application.properties` with your local DB credentials.
5. Run `DuediligenceApplication.java` as a Java Application.
6. App starts on `http://localhost:8080`.

## API Testing

Use Postman to test endpoints. Base URL: `http://localhost:8080/api`

## Team

## Notes

- Follow the branching workflow: create a `feature/<name>` branch off `team-two`, open a PR to merge back in.
- Keep commit messages clear and specific.
- See `/docs` for the full SRS, architecture diagram, and API contract.
