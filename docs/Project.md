# Autonomous Property Research and Real Estate Risk Assessment Intelligence System

## Overview
This system provides property search, validation, and comprehensive due diligence capabilities using the Google Geocoding API for address verification (with a Places API (New) details fallback for property-type classification) and a Spring Boot backend with a Next.js frontend. Users can search for Indian addresses, validate them through Google, and view property details stored in a database. The system also includes an extensive risk assessment data model covering ownership, tax, zoning, environmental, flood zone, utility, building permits, market trends, and comparable property data.

## Key Features

### Property Search & Validation
- Address validation via **Google Geocoding API v4** (`geocode.googleapis.com`) — the single wired strategy
- **Places API (New) fallback enrichment**: when geocoding match types leave the property type undetermined, one details call on the geocoded `places/ChIJ…` resource resolves Google's authoritative `primaryType`
- Property type classified into the fixed `PropertyType` enum (Residential, Commercial, Industrial, Agricultural, Mixed Use, Land) by the shared `PropertyTypeClassifier`; persistence is hard-gated through `normalize()` so only supported values are stored (undetermined stays null rather than guessing)
- Automatic persistence of validated properties to database
- Graceful handling of API errors, invalid addresses, and network issues
- Mock fallback geocoder for development when API keys are missing/dummy

### Property Management
- CRUD operations for properties via REST API
- Property details storage including: address, city, state, postal code, coordinates, property type
- Search capabilities by city, state, and property type
- JPA/Hibernate ORM with H2 in-memory database (configurable to PostgreSQL)

### Risk Assessment Data Model
A fully scaffolded domain model for multi-dimensional property risk assessment:
- **Ownership Details** — owner name, ownership type, record date, external record ID
- **Tax Details** — tax amount, tax due, payment status, retrieval source
- **Zoning Details** — zoning code, status, allowed use, effective dates
- **Flood Zone Details** — zone classification, risk level, effective date
- **Environmental Details** — environmental record type, status, risk level
- **Utility Details** — utility type, provider, availability status
- **Building Permit Details** — permit number, type, status, issue/completion dates
- **Risk Assessment Details** — composite risk scores: tax, legal, flood, permit compliance, zoning compliance, ownership verification, overall score
- **Due Diligence Reports** — generated report linking property, user, risk assessment, executive summary, status
- **Supporting Docs** — file attachments linked to reports and properties
- **Property History** — snapshot record linking all detail entities for point-in-time capture
- **Comparable Property Details** — market comps with BHK, area, price, price/sqft, RERA ID
- **Market Trends** — city-level average price, supply count, demand pulse per period
- **Activity Log** — audit trail of user actions on entities
- **API Log** — per-request logging of external API calls (service name, endpoint, status, timing)
- **Property Monitoring** — active monitoring records per property
- **Notifications** — user notification entity

### Authentication & Security
- JWT-based authentication system with **access + refresh token pair** (standard 2-token scheme)
- Access tokens (1 hour) carry `sub` (email), `roles`, `type=access`, and a UUID `jti`; kept **only in JS memory** on the frontend (never localStorage)
- Refresh tokens (7 days) carry `type=refresh` + `roles`, are stored in DB (`refresh_tokens` table), and delivered as **HttpOnly, SameSite=Lax cookies** (path: `/api/auth` so both `/refresh` and `/logout` receive them)
- **Token rotation** — every refresh revokes the old token and issues a new one; `replaced_by_token` column tracks the chain
- **Token-type enforcement** — `JwtAuthenticationFilter` rejects any Bearer token whose `type` claim isn't `access`, so a refresh token can never be replayed as an access credential
- Self-registration blocked for `ADMINISTRATOR` role; only `BUYER`, `REAL_ESTATE_AGENT`, `LEGAL_REVIEWER`, `FINANCIAL_INSTITUTION` may register
- Role-based access control: `/api/admin/**` requires `ADMINISTRATOR` role; all other endpoints require authentication
- Password hashing with BCrypt (strength 10)
- Pre-seeded admin account: `admin@example.com` / `Admin@123`
- Stateless session management (`SessionCreationPolicy.STATELESS`)
- Method-level security enabled (`@EnableMethodSecurity`)
- CORS allows any localhost/127.0.0.1 port (`allowedOriginPatterns` with `[*]`) with credentials enabled

### User Interface
- Modern Next.js 15 frontend with App Router, React 18, TypeScript
- Responsive design using Tailwind CSS
- Dashboard with quick access to: Property Search, Due Diligence Reports, Property History
- **Backend-owned auth on the client**: access token lives in JS memory only; `initializeAuth()`/memoized `ensureAuthInitialized()` silently restore the session via `/api/auth/refresh` on every page load (no more logout-on-refresh)
- Shared `useAuthGuard` hook awaits session restore before redirecting — fixes the guard/restore race that bounced logged-in admins to the login page
- **Separate admin login** at `/admin/login` (server-rendered, `noindex`, no links from user login/register pages); single Sign-out control in the Navbar
- Register form has full client-side validation mirroring backend rules (name 2–60, email format, password ≥8, confirm match, allowed roles)
- Clean property details display with loading states
- Navigation between pages with proper authentication guards

## Technical Architecture

### Frontend
- **Framework**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect) + shared auth hooks (`lib/session.ts`, `lib/useAuth.ts`)
- **API Communication**: `fetchWithAuth` wrapper — attaches in-memory JWT, `credentials: 'include'`, auto-refresh + retry once on 401
- **Routing**: Client-side navigation with useRouter/useSearchParams; dev server proxies `/api/:path*` → backend :9090 (`next.config.mjs`)

### Backend
- **Framework**: Spring Boot 4.1.1 (Spring 7, Hibernate 7.4), Java 17
- **Architecture**: RESTful API with layered architecture (Controllers, Services, Repositories, Entities, DTOs)
- **Database**:
  - Default: H2 in-memory — `jdbc:h2:mem:backenddb;MODE=PostgreSQL`
  - Configurable: PostgreSQL (via `SPRING_PROFILES_ACTIVE=postgres`)
  - Schema: Auto-generated via `spring.jpa.hibernate.ddl-auto=create-drop`
  - Seed data: `data.sql` (roles + admin user) runs on every startup
- **External Integrations**: Google Geocoding API v4 (validation) + Places API (New) details (type enrichment fallback) via RestClient
- **Security**: JWT access+refresh token rotation, HttpOnly cookie for refresh token, BCrypt hashing
- **API Documentation**: OpenAPI/Swagger UI at `/swagger-ui.html`, API docs at `/v3/api-docs`
- **H2 Console**: Available at `/h2-console` (dev only)

### Build & Deployment
- Backend: Maven (`mvnw`), port **9090**
- Frontend: npm, port **3000** (any localhost port works — CORS accepts all)
- Secrets come from env vars or the **gitignored** `Backend/src/main/resources/google-credentials.properties` (loaded via `spring.config.import`); see `google-credentials.properties.example`

## Configuration

### Backend (`Backend/src/main/resources/application.properties`)
| Setting | Value |
|---------|-------|
| Server port | 9090 |
| Database | `jdbc:h2:mem:backenddb;MODE=PostgreSQL` |
| JPA DDL | `create-drop` (wipes all users on every restart — reseeded by `data.sql`) |
| Flyway | Disabled (local H2) |
| Google Geocoding base URL | `https://geocode.googleapis.com` |
| Google Geocoding API Key | `google.geocoding.api-key` ← `$GOOGLE_GEOCODING_API_KEY` or gitignored `google-credentials.properties` |
| Google Places API Key | `google.places.api-key` (defaults to the geocoding key) |
| Secrets import | `spring.config.import=optional:classpath:google-credentials.properties` |
| Jackson | `NON_NULL` inclusion; Spring Boot 4.1 / Jackson 3.x |
| Redis | Disabled (`spring.cache.type=none`) |
| JWT secret | `app.security.jwt-secret` ← `$JWT_SECRET` (dev fallback in properties) |
| JWT access expiry | 3,600,000 ms (1 hour) |
| JWT refresh expiry | 604,800,000 ms (7 days) |
| CORS | `allowedOriginPatterns` = any `localhost`/`127.0.0.1` port, credentials enabled |
| Logging | DEBUG for `com.duedilligenceagent`, INFO for Spring Security |

### Environment Variables / Local Secrets
Secrets are resolved from env vars, falling back to the **gitignored** `Backend/src/main/resources/google-credentials.properties` (copied from `google-credentials.properties.example`):
- `JWT_SECRET` — signing secret (min 32 chars)
- `GOOGLE_GEOCODING_API_KEY`, `GOOGLE_PLACES_API_KEY` (optional; defaults to the geocoding key)
- `SPRING_PROFILES_ACTIVE=postgres` (production DB)

## Database Schema

### Core Tables
| Table | Key Columns |
|-------|-------------|
| `property_details` | `property_id`, `address`, `city`, `state`, `postal_code`, `latitude`, `longitude`, `property_type`, `created_at`, `updated_at` |
| `users` | `user_id`, `email` (unique), `password_hash`, `is_active`, `role_id` (FK), `created_at`, `updated_at` |
| `roles` | `id`, `name` (unique), `description`, `created_at`, `updated_at` |
| `user_profiles` | `profile_id`, `user_id` (unique FK), `first_name`, `last_name`, `phone` |
| `refresh_tokens` | `token_id`, `token` (unique, 512 chars), `user_id`, `expires_at`, `revoked`, `replaced_by_token`, `created_at` |

### Risk & Due Diligence Tables
| Table | Key Fields |
|-------|-----------|
| `risk_assessment_details` | `property_id`, `tax_risk`, `legal_risk`, `flood_risk`, `permit_compliance`, `zoning_compliance`, `ownership_verification`, `overall_score`, `assessed_at` |
| `due_diligence_reports` | `property_id`, `generated_by` (user), `risk_assessment_id`, `executive_summary`, `status`, `generated_at` |
| `supporting_docs` | `report_id`, `property_id`, `uploaded_by`, `file_name`, `file_type`, `file_path`, `uploaded_at` |
| `ownership_details` | `property_id`, `owner_name`, `ownership_type`, `record_date`, `source`, `external_record_id` |
| `tax_details` | `property_id`, `tax_pay_date`, `tax_amount`, `tax_due`, `payment_status`, `source`, `retrieved_at` |
| `zoning_details` | `property_id`, `zoning_code`, `zoning_status`, `allowed_use`, `effective_from`, `effective_to`, `source` |
| `flood_zone_details` | `property_id`, `zone`, `risk_level`, `source`, `effective_date`, `retrieved_at` |
| `environmental_details` | `property_id`, `record_type`, `status`, `risk_level`, `description`, `source`, `retrieved_at` |
| `utility_details` | `property_id`, `utility_type`, `provider`, `availability_status`, `source`, `retrieved_at` |
| `building_permit_details` | `property_id`, `permit_number`, `permit_type`, `permit_status`, `issue_date`, `completion_date`, `description`, `source` |
| `property_history` | Snapshot FKs to ownership, tax, permit, zoning, flood zone, environmental, utility; `captured_at` |
| `comparable_property_details` | `property_id`, `city`, `locality`, `property_type`, `bhk`, `area_sqft`, `price`, `price_per_sqft`, `rera_id`, `verified`, `source` |
| `market_trends` | `city`, `locality`, `period`, `average_price`, `supply_count`, `demand_pulse`, `retrieved_at` |
| `activity_logs` | `user_id`, `action`, `entity_type`, `entity_id`, `created_at` |
| `api_logs` | `service_name`, `endpoint`, `request_time`, `response_time`, `status_code`, `success`, `error_message` |
| `property_monitoring` | Per-property monitoring records |
| `notifications` | User notification records |

### Domain Enums
| Enum | Purpose |
|------|---------|
| `RoleName` | BUYER, REAL_ESTATE_AGENT, LEGAL_REVIEWER, FINANCIAL_INSTITUTION, ADMINISTRATOR |
| `PropertyType` | RESIDENTIAL, COMMERCIAL, INDUSTRIAL, AGRICULTURAL, MIXED_USE, LAND (with display labels + `fromValue()` lenient lookup) |
| `RiskLevel` | LOW, MEDIUM, HIGH |
| `ReportStatus` | PENDING, IN_PROGRESS, COMPLETED, etc. |
| `PaymentStatus` | PAID, DUE, OVERDUE, etc. |
| `PermitStatus` | APPROVED, PENDING, REJECTED, EXPIRED, etc. |
| `PermitType` | CONSTRUCTION, RENOVATION, DEMOLITION, etc. |
| `ZoningStatus` | COMPLIANT, NON_COMPLIANT, PENDING, etc. |
| `EnvironmentalStatus` | CLEAN, CONTAMINATED, UNDER_REVIEW, etc. |
| `OwnershipVerificationStatus` | VERIFIED, DISPUTED, PENDING, etc. |
| `ComplianceStatus` | COMPLIANT, NON_COMPLIANT, etc. |
| `AvailabilityStatus` | AVAILABLE, UNAVAILABLE, PARTIAL, etc. |
| `UtilityType` | ELECTRICITY, WATER, GAS, etc. |
| `ActivityAction` | CREATE, UPDATE, DELETE, VIEW, etc. |
| `EntityType` | PROPERTY, REPORT, USER, etc. |

## API Endpoints

### Health (public)
- `GET /api/health` — Liveness check (plain-text "Backend is running")

### Authentication (`/api/auth/**` — all public)
- `POST /api/auth/register` — Register user (email, password, role)
- `POST /api/auth/login` — Login → access token + HttpOnly refresh cookie
- `POST /api/auth/refresh` — Refresh access token via HttpOnly `refresh_token` cookie (token rotation)
- `POST /api/auth/logout` — Revoke refresh token + clear cookies

### Properties (`/api/properties/**` — authenticated)
- `GET /api/properties` — Get all properties
- `GET /api/properties/{id}` — Get property by ID
- `POST /api/properties/search` — Search/validate property by address
- `GET /api/properties/search?city=&state=&propertyType=` — Filter by criteria

### Admin (`/api/admin/**` — ADMINISTRATOR role only)
- `GET /api/admin/dashboard` — Stats: total users, properties, admins
- `GET /api/admin/users` — All users with roles
- `DELETE /api/admin/users/{id}` — Delete user

### API Documentation (public)
- `GET /swagger-ui.html` — Swagger UI
- `GET /v3/api-docs` — OpenAPI spec

## DTOs

### Auth
- **`RegisterRequest`**: `email` (@Email, @NotBlank), `password` (@Size min=8), `role` (RoleName, @NotNull)
- **`LoginRequest`**: `email`, `password`
- **`AuthResponse`**: `accessToken`, `refreshToken`, `email`, `role`, `message`

### Property
- **`PropertyDetailsRequest`**: `address`
- **`PropertyResponse`**: `propertyId`, `address`, `city`, `state`, `postalCode`, `latitude`, `longitude`, `propertyType`
- **`PropertySearchApiResponse`**: envelope with `success`, `message`, `data` (`status` VALID|INVALID|ERROR, `results`)

### Google API DTOs (`dto/Google/`)
- **`GoogleCandidate`**: `placeId`, `formattedAddress`, `latitude`, `longitude`, `city`, `state`, `postalCode`, `propertyType`
- **`GoogleGeocodingResponse`**: Geocoding v4 response (address descriptors, navigation points, place types)
- **`GooglePlacesDetailsResponse`**: Places API (New) details response (`primaryType`, `types`)

### Admin & User
- **`DashboardResponse`**: `totalUsers`, `totalProperties`, `totalAdmins`
- **`UserAdminResponse`** (inline record): `userId`, `email`, `roleName`, `isActive`, `createdAt`
- `UserRegisterRequest`, `UserRegisterResponse`, `UserPortfolioResponse`

## Data Flow

### Property Search
1. Frontend POSTs address to `/api/properties/search` with JWT bearer header
2. `JwtAuthenticationFilter` validates token (must be `type=access`) → sets `SecurityContext`
3. `PropertyController` → `PropertySearchService`
4. `GoogleGeocodingStrategy` calls Google Geocoding v4 → `GoogleCandidate` list; `PropertyTypeClassifier.fromGeocodingTypes()` maps match types to a `PropertyType`
5. If type undetermined → `GooglePlacesDetailsService` one-call enrichment on the geocoded `place` resource → `PropertyTypeClassifier.fromPlaces(primaryType, types)` (silent degradation on any failure)
6. Best candidate persisted through `PropertyTypeClassifier.normalize()` hard gate → `PropertyRepository` → returns `ResolvedPlace` with `propertyId`
7. Frontend redirects to `/property-details?propertyId={id}` on VALID; shows error on INVALID/ERROR

### Authentication Flow
1. **Register** → client-side validation mirrors backend (`@Size(min=8)` etc.) → BCrypt hash → save `User` → generate access+refresh JWT → set HttpOnly cookie (`Path=/api/auth`) → `AuthResponse`. Duplicate email → **409**, no stack trace
2. **Login** → `AuthenticationManager` → bad credentials → clean **401**; else generate tokens → rotate refresh token in DB → set cookie → `AuthResponse` (accessToken + email + role)
3. **Refresh** → read HttpOnly cookie → validate DB token (`isValid()`) → rotate → new access token + email + role returned (refresh JWT carries the `roles` claim)
4. **Logout** → revoke DB token (cookie path `/api/auth` ensures the server receives it) → clear cookie
5. **Frontend restore** → on load, `ensureAuthInitialized()` POSTs `/api/auth/refresh` once (memoized) to repopulate the in-memory access token before guards run

### Per-Request Token Validation
- `JwtAuthenticationFilter` skips: `/api/auth/**`, `/api/health`, `/swagger-ui/**`, `/v3/api-docs/**`, `/error`
- Missing `Bearer` header → 401 JSON immediately
- `JwtService.isTokenValid()` → username + expiry check
- Invalid → 401 JSON; Valid → `SecurityContextHolder` set

## Development Setup

### Prerequisites
- Java 17+, Node.js 16+, Maven (wrapper included)
- Google Maps Platform API keys (mock fallback available in dev)

### Backend
```bash
cd Backend
./mvnw spring-boot:run
```

### Frontend
```bash
npm install && npm run dev
```

### Default Admin Credentials
- Email: `admin@example.com` | Password: `Admin@123` | Role: `ADMINISTRATOR`

### Dev Tools
- H2 Console: `http://localhost:9090/h2-console` (JDBC URL: `jdbc:h2:mem:backenddb`)
- Swagger UI: `http://localhost:9090/swagger-ui.html`
- Health: `http://localhost:9090/api/health`

## Known Limitations

1. **Redis caching disabled** — `spring.cache.type=none`; `@Cacheable` commented out in `PropertyService` due to Spring DevTools classloader conflict
2. **`System.out.println`** in `JwtAuthenticationFilter` logs the Authorization header — replace with SLF4J before production
3. **`cookie.setSecure(false)`** in `RefreshTokenService` — must be `true` in production (HTTPS)
4. Risk/due diligence entities fully modeled but **no controllers or services yet** — data-layer scaffolding only
5. Every search creates a new `Property` record (no deduplication)
6. Property type is only ever one of the 6 `PropertyType` categories; Google's ~3,700 raw place types are mapped down (the raw value is not yet stored — see Future Enhancements)

## Resolved Issues
1. **Hydration Mismatch** — Fixed in Navbar by deferring auth check to client mount
2. **LazyInitializationException** — Fixed by marking `AuthService.login()` as `@Transactional`
3. **Refresh Token Rotation** — Implemented with `replaced_by_token` chain and `revoked` flag
4. **Inconsistent UI** — Dashboard cards uniform height with flex layouts
5. **Navigation Flow** — Removed unnecessary 1.5s timeout after validation
6. **Logout never revoked the token** — cookie path was `/api/auth/refresh`; widened to `/api/auth` so `/logout` receives it
7. **Refresh returned `role: null`** — refresh JWTs now carry the `roles` claim
8. **Duplicate-email register → 500 + stack trace** — typed exceptions + `GlobalExceptionHandler` now return clean 409/401/400 JSON
9. **Guard/restore race (admin bounce, logout-on-refresh)** — memoized `ensureAuthInitialized()` + shared `useAuthGuard` await session restore before redirecting
10. **Refresh token replayable as Bearer** — filter now enforces `type=access`
11. **CORS "Access denied" on non-default frontend ports** — `allowedOriginPatterns` accepts any localhost port
12. **Hardcoded secrets in `application.properties`** — externalized to env vars / gitignored `google-credentials.properties`
13. **Two sign-out buttons / admin exposed on user pages** — separate server-rendered `/admin/login`, single Navbar control

## Project Structure

```
├── Backend/
│   ├── src/main/java/com/duedilligenceagent/backend/
│   │   ├── config/
│   │   │   ├── AddressValidationStrategyConfig.java  # Wires Google Geocoding as sole strategy
│   │   │   ├── PasswordConfig.java           # BCryptPasswordEncoder bean
│   │   │   ├── SecurityConfig.java           # Filter chain, role rules
│   │   │   └── WebConfig.java                # CORS (any localhost port + credentials)
│   │   ├── controller/
│   │   │   ├── AdminController.java          # /api/admin/**
│   │   │   ├── AuthController.java           # /api/auth/**
│   │   │   ├── HealthController.java         # /api/health
│   │   │   └── PropertyController.java       # /api/properties/**
│   │   ├── dto/
│   │   │   ├── Google/                       # Google API response DTOs
│   │   │   ├── Property/                     # Property request/response DTOs
│   │   │   ├── User/                         # User DTOs
│   │   │   ├── AuthResponse.java
│   │   │   ├── DashboardResponse.java
│   │   │   ├── LoginRequest.java
│   │   │   ├── PropertyResponse.java
│   │   │   ├── RefreshTokenRequest.java
│   │   │   └── RegisterRequest.java
│   │   ├── entities/
│   │   │   ├── enums/                        # RoleName, RiskLevel, ReportStatus, etc.
│   │   │   ├── ActivityLog.java
│   │   │   ├── ApiLog.java
│   │   │   ├── BuildingPermitDetails.java
│   │   │   ├── ComparablePropertyDetails.java
│   │   │   ├── DueDiligenceReport.java
│   │   │   ├── EnvironmentalDetails.java
│   │   │   ├── FloodZoneDetails.java
│   │   │   ├── MarketTrends.java
│   │   │   ├── Notification.java
│   │   │   ├── OwnershipDetails.java
│   │   │   ├── Property.java
│   │   │   ├── PropertyHistory.java
│   │   │   ├── PropertyMonitoring.java
│   │   │   ├── RefreshToken.java
│   │   │   ├── RiskAssessmentDetails.java
│   │   │   ├── Role.java
│   │   │   ├── SupportingDocs.java
│   │   │   ├── TaxDetails.java
│   │   │   ├── User.java
│   │   │   ├── UserProfile.java
│   │   │   ├── UtilityDetails.java
│   │   │   └── ZoningDetails.java
│   │   ├── repositories/
│   │   │   ├── PropertyRepository.java
│   │   │   ├── RefreshTokenRepository.java
│   │   │   ├── RoleRepository.java
│   │   │   └── UserRepository.java
│   │   ├── security/
│   │   │   ├── CustomUserDetailsService.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   └── JwtService.java
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   ├── PropertySearchService.java
│   │   │   ├── PropertyService.java
│   │   │   └── RefreshTokenService.java
│   │   ├── exception/                        # GlobalExceptionHandler + typed auth exceptions
│   │   └── services/                         # Geocoding strategy + Places enrichment + classifier
│   │       ├── AddressValidationStrategy.java
│   │       ├── GoogleGeocodingStrategy.java
│   │       ├── GooglePlacesDetailsService.java
│   │       └── PropertyTypeClassifier.java   # Shared Google→PropertyType mapping
│   └── src/main/resources/
│       ├── application.properties
│       ├── google-credentials.properties.example  # Gitignored local-secrets template
│       └── data.sql                          # Seed: roles + admin user
├── app/                                      # Next.js frontend (App Router)
│   ├── admin/login/page.tsx                # Server-rendered, noindex (separate admin entry)
│   ├── admin/login/AdminLoginForm.tsx
│   ├── admin/dashboard/page.tsx
│   ├── dashboard/page.tsx
│   ├── history/page.tsx
│   ├── login/page.tsx
│   ├── page.tsx
│   ├── property-details/page.tsx
│   ├── property-search/page.tsx
│   ├── register/page.tsx                   # Client-side validation mirrors backend rules
│   ├── reports/page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Navbar.tsx                          # Page-aware shell, single Sign-out control
│   ├── ToastHost.tsx
│   └── ToastHostClient.tsx
├── lib/
│   ├── api.ts                              # fetchWithAuth: Bearer + 401→refresh→retry-once
│   ├── session.ts                          # In-memory token, initializeAuth/ensureAuthInitialized
│   ├── useAuth.ts                          # Shared useAuthGuard hook
│   └── useToast.ts
├── docs/
│   ├── Project.md
│   ├── SERVICE_ANALYSIS.md
│   ├── Design-analysis.md
│   ├── architecture.md
│   └── README.md
├── public/
├── .gitignore
├── next.config.mjs                         # /api/:path* proxy → backend :9090
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Future Enhancements

### Technical
1. **Risk Assessment Services** — Implement service + controller layer for all scaffolded entities
2. **Due Diligence Report PDF** — iText or Apache PDFBox export
3. **Redis Caching** — Re-enable once properly configured (`spring.cache.type=redis`)
4. **Security Hardening** — `setSecure(true)` on the refresh cookie (HTTPS), replace `System.out.println` in `JwtAuthenticationFilter` with SLF4J (JWT secret/env-var externalization is done)
5. **Flyway Migrations** — Replace `ddl-auto=create-drop` for production
6. **Testing** — Unit and integration tests for core services

### Features
1. User-specific property association
2. Address deduplication before persisting
3. Expose `PropertyHistory` snapshots via API
4. Supporting documents file upload
5. Surface `ActivityLog` / `ApiLog` in admin UI
6. Comparable Properties & Market Trends API
7. Store Google's raw `primaryType` alongside the mapped `PropertyType` (hybrid taxonomy column)
8. Replace the classifier's substring heuristics with a generated mapping from Google's published Place Types list

## Conclusion
The system has evolved from a property search foundation into a comprehensive real estate due diligence platform. The backend features 18+ JPA entities covering the full risk assessment domain, a secure access+refresh JWT token architecture with HttpOnly cookies and rotation, and clean layered architecture. The next phase is wiring up service and controller layers for the risk assessment domain entities.
