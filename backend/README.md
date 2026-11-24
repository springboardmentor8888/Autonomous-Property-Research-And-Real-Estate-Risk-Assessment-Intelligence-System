# Real Estate Due Diligence Agent

Infosys Springboard internship project (Team Two). A buyer enters a property address; the platform validates it, gathers ownership, tax, zoning, flood, permit, environmental and utility data, calculates a risk score, and produces a PDF/Excel report.

- **Live app:** <vercel url>
- **API docs (Swagger):** <render url>/swagger-ui.html
- **Postman collection:** `docs/postman/`

## Tech stack

Java, Spring Boot, Spring Security (JWT, role-based access), Spring Data JPA, PostgreSQL (Neon), React/Next.js (Vercel), Docker (Render), JUnit 5 + Mockito.

## Features

Registration/login with JWT and 5 roles; address validation (Geoapify); property search and creation; 7 due-diligence modules; risk assessment; comparable properties; PDF and Excel reports; email notification; audit log; admin dashboard.

## Architecture

React frontend -> Spring Boot REST API (controller -> service -> repository) -> PostgreSQL.
External: Geoapify (address validation), Gmail SMTP (email). Ownership, tax, zoning, flood and permit data is **simulated**, because real registry APIs aren't available to students.

## ER diagram

```mermaid
erDiagram
    properties ||--o{ ownership_records : has
    properties ||--o{ tax_history : has
    properties ||--o| zoning_info : has
    properties ||--o| flood_zone_info : has
    properties ||--o{ permit_records : has
    properties ||--o| environmental_records : has
    properties ||--o| utility_info : has
    users ||--o{ audit_logs : "performs (by email)"

    users { bigint id PK
            string full_name
            string email UK
            string password
            string role }
    properties { bigint id PK
                 string address
                 string city
                 string state
                 string zip_code
                 string property_type }
    ownership_records { bigint id PK
                        bigint property_id FK
                        string owner_name
                        date acquired_date
                        date transfer_date }
    tax_history { bigint id PK
                  bigint property_id FK
                  int year
                  decimal amount_paid
                  string status }
    zoning_info { bigint id PK
                  bigint property_id FK
                  string zone_type
                  boolean compliant }
    flood_zone_info { bigint id PK
                      bigint property_id FK
                      string zone
                      string risk_level }
    permit_records { bigint id PK
                     bigint property_id FK
                     string permit_type
                     string status
                     date issued_date }
    environmental_records { bigint id PK
                            bigint property_id FK
                            boolean hazard_found
                            string hazard_type
                            date assessment_date }
    utility_info { bigint id PK
                   bigint property_id FK
                   boolean water_connected
                   boolean electricity_connected
                   boolean gas_connected
                   string provider }
    audit_logs { bigint id PK
                 string user_email
                 string action
                 string details
                 datetime timestamp }
```

## Run locally

1. Install Java, Maven, PostgreSQL; create a database `duediligence_db`.
2. Set environment variables: `DB_PASSWORD`, `JWT_SECRET` (32+ chars), `GEOAPIFY_API_KEY`, `MAIL_USERNAME`, `MAIL_APP_PASSWORD`.
3. Backend: `cd backend && ./mvnw spring-boot:run` (http://localhost:8080).
4. Frontend: `cd frontend && npm install && npm run dev` (http://localhost:3000).
5. Tests: `cd backend && ./mvnw test`.

## Deployment

Neon (database), Render (backend Docker image), Vercel (frontend). Config is by environment variables: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `GEOAPIFY_API_KEY`, `MAIL_*`, `CORS_ALLOWED_ORIGINS`, `NEXT_PUBLIC_API_BASE_URL`.

## Known limitations

Simulated registry data; free hosting sleeps when idle; JWT has no refresh or revocation.

## Team

Backend: <your name>. Frontend and database: <teammates>.
