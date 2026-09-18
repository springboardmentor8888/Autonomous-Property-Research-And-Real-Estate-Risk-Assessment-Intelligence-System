# Database Design — Autonomous Property Research & Real Estate Risk Assessment Intelligence System

> Derived from `docs/Project.md`, `docs/SERVICE_ANALYSIS.md`, and the JPA entities in
> `Backend/src/main/java/com/duedilligenceagent/backend/entities/`. This document describes
> the schema **as actually implemented** (22 tables), plus the gaps between design docs and reality.

---

## 1. Technology & Environment

| Aspect | Current state |
|---|---|
| ORM | Spring Data JPA / Hibernate 7.4 (Spring Boot 4.1.1, Java 17) |
| Database (dev/default) | H2 in-memory — `jdbc:h2:mem:backenddb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL` |
| Database (target/prod) | PostgreSQL via `SPRING_PROFILES_ACTIVE=postgres` (**profile file not yet created**) |
| Schema generation | `spring.jpa.hibernate.ddl-auto=create-drop` (H2 is wiped on every restart) |
| Migrations | Flyway present but **disabled** (`spring.flyway.enabled=false`); `db/migration/` is empty |
| Seed data | `data.sql` runs on every startup (`defer-datasource-initialization=true`): 5 roles + admin user |
| Caching | Redis disabled (`spring.cache.type=none`); DB is the only store |
| Dev console | H2 console at `/h2-console` (JDBC URL `jdbc:h2:mem:backenddb`, user `sa`, blank password) |
| View layer | `spring.jpa.open-in-view=false` — lazy relations must be fetched in a transaction |

### Schema conventions (as implemented)
- Table names: `snake_case`, plural-ish (`users`, `property_details`, `risk_assessment_details`).
- Primary keys: surrogate `BIGINT` (`@GeneratedValue(strategy = IDENTITY)`), named `<entity>_id`.
- Foreign keys: **dual-mapped** — a raw `xxx_id` column carries the value (`nullable` enforced on it),
  while the object reference is a read-only association (`insertable = false, updatable = false`, `FetchType.LAZY`).
- Timestamps: `TIMESTAMP` (`LocalDateTime`); audit columns `created_at` are `updatable = false`.
- Money/scores: `DECIMAL(p,s)` via `BigDecimal` — never floating point.
- Coordinates: `DECIMAL(10,8)` / `DECIMAL(11,8)` — enough precision for sub-metre plotting.
- Status/type columns: `VARCHAR`, **not** native SQL enums and **not** `@Enumerated` — the Java enums in
  `entities/enums/` document the legal values, but persistence is plain strings.

---

## 2. Entity–Relationship Map

```
                         ┌───────────┐
                         │   roles   │
                         └─────┬─────┘
                               │ 1:N
┌──────────────┐          ┌────▼────┐
│user_profiles │──N:1────▶│  users  │◀────────────┐
└──────────────┘   1:1    └────┬────┘             │
   (unique user_id)            │ 1:N              │
                          ┌────▼────────┐         │
                          │refresh_tokens│        │
                          └─────────────┘         │
                                                  │ N:1
┌───────────────────────┐      ┌──────────────────┴──────┐
│  property_details     │◀─────│        Property         │◀── hub for everything below
│  (the central hub)    │      └─────────────────────────┘
└──────────┬────────────┘
           │ 1:N (property_id FK)
   ┌───────┼──────────────────────────────────────────────────────────────┐
   │       │                                                              │
   ▼       ▼                                                              ▼
 ownership_details   tax_details   zoning_details   flood_zone_details   environmental_details
 utility_details     building_permit_details        comparable_property_details
 risk_assessment_details ◀── 1:1 ── due_diligence_reports ──N:1──▶ users (generated_by)
                                          │ 1:N
                                          ▼
                                    supporting_docs ──N:1──▶ property_details / users
                                          
 property_history ──N:1──▶ each of the 7 detail tables (point-in-time snapshot fan-out)
 property_monitoring ──N:1──▶ property_details + users   (unique user_id+property_id)
 notifications ──N:1──▶ users + property_details + due_diligence_reports
 activity_logs ──N:1──▶ users (generic entity_type/entity_id audit — no target FK)
 api_logs               (standalone — external API call telemetry, no FKs)
 market_trends          (standalone — city/locality aggregates keyed by strings, no FK)
```

Relationship inventory (all associations declared on the owning side):

| From | To | Type | FK column | Nullable |
|---|---|---|---|---|
| users | roles | N:1 | `role_id` | NOT NULL |
| users | user_profiles | 1:1 (inverse `mappedBy="user"`, cascade ALL, orphanRemoval) | `user_profiles.user_id` unique | NOT NULL |
| refresh_tokens | users | logical N:1 (plain column, **no mapped association**) | `user_id` | NOT NULL |
| ownership/tax/zoning/flood/environmental/utility/permit/comparable_details | property_details | N:1 | `property_id` | NOT NULL |
| risk_assessment_details | property_details | N:1 | `property_id` | NOT NULL |
| due_diligence_reports | property_details | N:1 | `property_id` | NOT NULL |
| due_diligence_reports | users | N:1 | `generated_by` | NOT NULL |
| due_diligence_reports | risk_assessment_details | 1:1 (read-only join col) | `risk_assessment_id` | NULL |
| supporting_docs | due_diligence_reports / property_details / users | N:1 ×3 | `report_id`, `property_id`, `uploaded_by` | NOT NULL |
| property_history | property + 7 detail tables | N:1 ×8 | see §4.13 | property NOT NULL, rest NULL |
| property_monitoring | property_details, users | N:1 ×2 | `property_id`, `user_id` | NOT NULL |
| notifications | users, property_details, due_diligence_reports | N:1 ×3 | `user_id` NN; `property_id`, `report_id` NULL | mixed |
| activity_logs | users | N:1 | `user_id` | NOT NULL |

---

## 3. Domain Grouping

| Group | Tables | Purpose |
|---|---|---|
| Identity & access | `roles`, `users`, `user_profiles`, `refresh_tokens` | RBAC + JWT access/refresh-token rotation store |
| Core entity | `property_details` | Validated address hub — every risk table hangs off it |
| Due-diligence facts (8) | `ownership_details`, `tax_details`, `zoning_details`, `flood_zone_details`, `environmental_details`, `utility_details`, `building_permit_details`, `comparable_property_details` | Externally sourced records, append-only, provenance-tracked |
| Assessment & output | `risk_assessment_details`, `due_diligence_reports`, `supporting_docs` | Scores → report → attachments |
| Market intelligence | `market_trends`, `comparable_property_details` | City/locality pricing signals |
| Temporal/ops | `property_history`, `property_monitoring`, `notifications`, `activity_logs`, `api_logs` | Snapshots, scheduled checks, alerts, auditing, API telemetry |

---

## 4. Table Dictionary

Legend: **PK** primary key · **FK** foreign key · **U** unique · **NN** NOT NULL · **DF** default.

### 3.1 Identity & Access

#### 4.1 `roles` — Role entity (Java: `Role`)
| Column | Type | Constraints | Notes |
|---|---|---|---|
| id | BIGINT | PK, identity | |
| name | VARCHAR(50) | NN, **U** | enum `RoleName`: BUYER, REAL_ESTATE_AGENT, LEGAL_REVIEWER, FINANCIAL_INSTITUTION, ADMINISTRATOR |
| description | VARCHAR(255) | | human label |
| created_at | TIMESTAMP | NN, immutable | |
| updated_at | TIMESTAMP | NN | |

Seed (data.sql): the 5 `RoleName` values, idempotent `WHERE NOT EXISTS` inserts.

#### 4.2 `users` — (Java: `User`)
| Column | Type | Constraints | Notes |
|---|---|---|---|
| user_id | BIGINT | PK, identity | |
| email | VARCHAR(100) | NN, **U** | login identity; JWT `sub` |
| password_hash | VARCHAR(255) | NN | BCrypt strength 10 |
| is_active | BOOLEAN | NN, DF true | |
| role_id | BIGINT | NN, **FK → roles.id** | N:1 LAZY |
| created_at | TIMESTAMP | NN, immutable | |
| updated_at | TIMESTAMP | NN | |

Inverse 1:1 → `user_profiles` (cascade ALL + orphanRemoval). Seeded admin: `admin@example.com` / `Admin@123`, ADMINISTRATOR.

#### 4.3 `user_profiles` — (Java: `UserProfile`)
| Column | Type | Constraints | Notes |
|---|---|---|---|
| profile_id | BIGINT | PK, identity | |
| user_id | BIGINT | NN, **U** (`uk_user_profile_user_id`), **FK → users** | 1:1 |
| first_name | VARCHAR(50) | NN | |
| last_name | VARCHAR(50) | NN | |
| phone | VARCHAR(20) | | |
| created_at / updated_at | TIMESTAMP | NN | |

#### 4.4 `refresh_tokens` — (Java: `RefreshToken`)
| Column | Type | Constraints | Notes |
|---|---|---|---|
| token_id | BIGINT | PK, identity | |
| token | VARCHAR(512) | NN, **U** | the JWT refresh string |
| user_id | BIGINT | NN | owner (plain column — no mapped association) |
| expires_at | TIMESTAMP | NN | 7-day TTL |
| created_at | TIMESTAMP | NN, immutable | |
| revoked | BOOLEAN | NN, DF false | set on rotation/logout |
| replaced_by_token | VARCHAR(512) | | successor token — rotation chain |

Supports the auth flow in Project.md: every refresh revokes the old row and inserts a new one;
`revoked` + `expires_at` are the `isValid()` gate. Indexed lookups run via `RefreshTokenRepository` by `token`.

### 3.2 Core

#### 4.5 `property_details` — (Java: `Property`) — **the hub table**
| Column | Type | Constraints | Notes |
|---|---|---|---|
| property_id | BIGINT | PK, identity | returned as `ResolvedPlace.propertyId` |
| address | VARCHAR(255) | NN | Google `formatted_address` |
| city | VARCHAR(100) | NN | from geocoding address components |
| state | VARCHAR(100) | NN | |
| postal_code | VARCHAR(20) | | Indian PIN; may be **borrowed from Mappls** when Google's match had none (SERVICE_ANALYSIS §2.3) |
| latitude | DECIMAL(10,8) | | Google-sourced only — Mappls has no WGS84 on the free plan |
| longitude | DECIMAL(11,8) | | |
| property_type | VARCHAR(50) | NULL | `PropertyType` label, hard-gated by `PropertyTypeClassifier.normalize()`: Residential / Commercial / Industrial / Agricultural / Mixed Use / Land — **null = undetermined beats wrong** |
| created_at | TIMESTAMP | NN, immutable | |
| updated_at | TIMESTAMP | NN | |

Write path: only `PropertySearchService.searchByAddress` persists here, **one new row per search**
(known limitation #4 — no dedup; `(address, postal_code)` uniqueness is a candidate future constraint).

### 3.3 Due-Diligence Fact Tables (append-only, provenance-tracked)

Common provenance pattern on every table in this group: `source VARCHAR(100)` (which registry/provider),
`external_record_id VARCHAR(100)` (id in that source), `retrieved_at TIMESTAMP NN`
(`ownership_details` omits `retrieved_at` and relies on `record_date` alone).
All are N:1 → `property_details.property_id` (NN) and have **no mapped repository yet** (scaffolded only).

#### 4.6 `ownership_details` — (Java: `OwnershipDetails`)
| Column | Type | Constraints |
|---|---|---|
| ownership_id | BIGINT | PK |
| property_id | BIGINT | NN, FK |
| owner_name | VARCHAR(100) | NN |
| ownership_type | VARCHAR(50) | e.g. freehold/leasehold |
| record_date | DATE | |
| source / external_record_id | VARCHAR(100) | |

#### 4.7 `tax_details` — (Java: `TaxDetails`)
| Column | Type | Constraints |
|---|---|---|
| tax_id | BIGINT | PK |
| property_id | BIGINT | NN, FK |
| tax_pay_date | DATE | |
| tax_amount | DECIMAL(15,2) | |
| tax_due | DECIMAL(15,2) | outstanding arrears feed `tax_risk` score |
| payment_status | VARCHAR(30) | `PaymentStatus`: PAID, UNPAID, OVERDUE, PARTIALLY_PAID |
| source / external_record_id | VARCHAR(100) | |
| retrieved_at | TIMESTAMP | NN |

#### 4.8 `zoning_details` — (Java: `ZoningDetails`)
| Column | Type | Constraints |
|---|---|---|
| zoning_id | BIGINT | PK |
| property_id | BIGINT | NN, FK |
| zoning_code | VARCHAR(30) | NN |
| zoning_status | VARCHAR(30) | `ZoningStatus`: COMPLIANT / NON_COMPLIANT / PENDING … |
| allowed_use | VARCHAR(200) | |
| effective_from / effective_to | DATE | validity window |
| source | VARCHAR(100) | |
| retrieved_at | TIMESTAMP | NN |

#### 4.9 `flood_zone_details` — (Java: `FloodZoneDetails`)
| Column | Type | Constraints |
|---|---|---|
| flood_zone_id | BIGINT | PK |
| property_id | BIGINT | NN, FK |
| zone | VARCHAR(20) | |
| risk_level | VARCHAR(30) | `RiskLevel`: LOW / MEDIUM / HIGH / UNKNOWN |
| source | VARCHAR(100) | |
| effective_date | DATE | |
| retrieved_at | TIMESTAMP | NN |

#### 4.10 `environmental_details` — (Java: `EnvironmentalDetails`)
| Column | Type | Constraints |
|---|---|---|
| environmental_id | BIGINT | PK |
| property_id | BIGINT | NN, FK |
| record_type | VARCHAR(50) | |
| status | VARCHAR(30) | `EnvironmentalStatus`: CLEAR / FLAGGED / PENDING / NOT_FOUND |
| risk_level | VARCHAR(30) | `RiskLevel` |
| description | VARCHAR(500) | |
| source / external_record_id | VARCHAR(100) | |
| retrieved_at | TIMESTAMP | NN |

#### 4.11 `utility_details` — (Java: `UtilityDetails`)
| Column | Type | Constraints |
|---|---|---|
| utility_id | BIGINT | PK |
| property_id | BIGINT | NN, FK |
| utility_type | VARCHAR(50) | `UtilityType`: ELECTRICITY / WATER / GAS … |
| provider | VARCHAR(100) | |
| availability_status | VARCHAR(30) | `AvailabilityStatus`: AVAILABLE / NOT_AVAILABLE / UNKNOWN / NOT_VERIFIED |
| source | VARCHAR(100) | |
| retrieved_at | TIMESTAMP | NN |

#### 4.12 `building_permit_details` — (Java: `BuildingPermitDetails`)
| Column | Type | Constraints |
|---|---|---|
| permit_id | BIGINT | PK |
| property_id | BIGINT | NN, FK |
| permit_number | VARCHAR(50) | NN |
| permit_type | VARCHAR(50) | `PermitType`: BUILDING / RENOVATION / DEMOLITION / OCCUPANCY / ELECTRICAL / PLUMBING … |
| permit_status | VARCHAR(30) | `PermitStatus`: PENDING / APPROVED / REJECTED / EXPIRED / COMPLETED |
| issue_date / completion_date | DATE | |
| description | VARCHAR(500) | |
| source / external_record_id | VARCHAR(100) | |
| retrieved_at | TIMESTAMP | NN |

#### 4.13 `comparable_property_details` — (Java: `ComparablePropertyDetails`)
| Column | Type | Constraints |
|---|---|---|
| comparable_id | BIGINT | PK |
| property_id | BIGINT | NN, FK (the subject property the comp is for) |
| external_listing_id | VARCHAR(100) | portal listing id |
| city | VARCHAR(100) | NN |
| locality | VARCHAR(100) | |
| property_type | VARCHAR(50) | |
| bhk | VARCHAR(10) | Indian BHK notation, kept as string ("2BHK", "3.5") |
| area_sqft | INT | |
| price | DECIMAL(15,2) | |
| price_per_sqft | DECIMAL(10,2) | valuation input |
| rera_id | VARCHAR(50) | Karnataka/Maharashtra RERA registration |
| verified | BOOLEAN | DF false |
| source | VARCHAR(100) | |
| retrieved_at | TIMESTAMP | NN |

### 3.4 Assessment & Reporting

#### 4.14 `risk_assessment_details` — (Java: `RiskAssessmentDetails`)
| Column | Type | Constraints | Notes |
|---|---|---|---|
| risk_assessment_id | BIGINT | PK | |
| property_id | BIGINT | NN, FK | |
| tax_risk | DECIMAL(5,2) | | 0–100 sub-score |
| legal_risk | DECIMAL(5,2) | | |
| flood_risk | DECIMAL(5,2) | | |
| permit_compliance | DECIMAL(5,2) | | |
| zoning_compliance | DECIMAL(5,2) | | |
| ownership_verification | DECIMAL(5,2) | | mirrors `OwnershipVerificationStatus` scale |
| overall_score | DECIMAL(5,2) | | weighted composite |
| assessed_at | TIMESTAMP | NN | scoring timestamp |

#### 4.15 `due_diligence_reports` — (Java: `DueDiligenceReport`)
| Column | Type | Constraints | Notes |
|---|---|---|---|
| report_id | BIGINT | PK | |
| property_id | BIGINT | NN, FK → property_details | |
| generated_by | BIGINT | NN, FK → users | requesting user |
| risk_assessment_id | BIGINT | NULL, FK (1:1 read-only) | the scoring run embedded in the report |
| executive_summary | VARCHAR(2000) | | |
| status | VARCHAR(30) | `ReportStatus`: GENERATING / COMPLETED / FAILED | |
| generated_at / updated_at | TIMESTAMP | NN | |

#### 4.16 `supporting_docs` — (Java: `SupportingDocs`)
| Column | Type | Constraints |
|---|---|---|
| document_id | BIGINT | PK |
| report_id | BIGINT | NN, FK → due_diligence_reports |
| property_id | BIGINT | NN, FK → property_details |
| uploaded_by | BIGINT | NN, FK → users |
| file_name | VARCHAR(255) | NN |
| file_type | VARCHAR(50) | MIME/extension |
| file_path | VARCHAR(500) | NN — storage path (filesystem/object store, not BLOB) |
| uploaded_at | TIMESTAMP | NN |

### 3.5 Temporal, Monitoring & Ops

#### 4.17 `property_history` — (Java: `PropertyHistory`) — point-in-time snapshot fan-out
| Column | Type | Constraints |
|---|---|---|
| history_id | BIGINT | PK |
| property_id | BIGINT | NN, FK |
| ownership_id | BIGINT | NULL, FK → ownership_details |
| tax_id | BIGINT | NULL, FK → tax_details |
| permit_id | BIGINT | NULL, FK → building_permit_details |
| zoning_id | BIGINT | NULL, FK → zoning_details |
| flood_zone_id | BIGINT | NULL, FK → flood_zone_details |
| environmental_id | BIGINT | NULL, FK → environmental_details |
| utility_id | BIGINT | NULL, FK → utility_details |
| captured_at | TIMESTAMP | NN |

Design note: snapshot-by-reference (rows stay append-only; the history row pins the id set as of
`captured_at`), not copy-by-value. A "current state" read ignores this table; replay reads it.

#### 4.18 `property_monitoring` — (Java: `PropertyMonitoring`)
| Column | Type | Constraints |
|---|---|---|
| monitoring_id | BIGINT | PK |
| property_id | BIGINT | NN, FK |
| user_id | BIGINT | NN, FK |
| enabled | BOOLEAN | NN, DF true |
| last_checked_at | TIMESTAMP | |
| next_check_at | TIMESTAMP | scheduler poll cursor |
| created_at | TIMESTAMP | NN, immutable |

**U** `(user_id, property_id)` — `uk_property_monitoring_user_property`: one watch per user per property.
Drives the (not-yet-built) monitoring job that re-runs risk checks and raises `notifications`.

#### 4.19 `notifications` — (Java: `Notification`)
| Column | Type | Constraints |
|---|---|---|
| notification_id | BIGINT | PK |
| user_id | BIGINT | NN, FK → users |
| property_id | BIGINT | NULL, FK |
| report_id | BIGINT | NULL, FK → due_diligence_reports |
| notification_type | VARCHAR(50) | NN |
| message | VARCHAR(500) | NN |
| status | VARCHAR(30) | e.g. UNREAD / READ / SENT |
| created_at | TIMESTAMP | NN, immutable |
| sent_at | TIMESTAMP | dispatch time |

#### 4.20 `activity_logs` — (Java: `ActivityLog`) — generic audit trail
| Column | Type | Constraints |
|---|---|---|
| activity_log_id | BIGINT | PK |
| user_id | BIGINT | NN, FK → users |
| action | VARCHAR(100) | NN — `ActivityAction`: CREATE / UPDATE / DELETE / VIEW / SEARCH / DOWNLOAD … |
| entity_type | VARCHAR(50) | `EntityType`: USER / PROPERTY / OWNERSHIP / TAX / BUILDING_PERMIT / REPORT … |
| entity_id | BIGINT | polymorphic target id — **intentionally no FK** |
| created_at | TIMESTAMP | NN, immutable |

#### 4.21 `api_logs` — (Java: `ApiLog`) — external-API telemetry (no FKs)
| Column | Type | Constraints |
|---|---|---|
| api_log_id | BIGINT | PK |
| service_name | VARCHAR(100) | NN — GOOGLE_GEOCODING / GOOGLE_PLACES / MAPPLS … |
| endpoint | VARCHAR(255) | NN |
| request_time / response_time | TIMESTAMP | request NN; response NULL until completion |
| status_code | INT | provider HTTP status |
| success | BOOLEAN | |
| error_message | VARCHAR(500) | |
| created_at | TIMESTAMP | NN, immutable |

#### 4.22 `market_trends` — (Java: `MarketTrends`) — string-keyed aggregates (no FKs)
| Column | Type | Constraints |
|---|---|---|
| market_trend_id | BIGINT | PK |
| city | VARCHAR(100) | NN |
| locality | VARCHAR(100) | |
| period | VARCHAR(20) | NN — e.g. "2026-Q3" |
| average_price | DECIMAL(15,2) | |
| supply_count | INT | active listings |
| demand_pulse | DECIMAL(5,2) | demand index |
| retrieved_at | TIMESTAMP | NN |

Decoupled from `property_details` by design (joined by `city`/`locality` strings, not ids).
Natural key candidate: `(city, locality, period)` — currently **not** enforced.

---

## 5. Enums (documentation layer)

`entities/enums/` — 15 Java enums. Persisted as strings; no `@Enumerated(STRING)` anywhere, so
values are not checked at the persistence layer. `PropertyType` is the only enum with a
persistence gate in code (`PropertyTypeClassifier.normalize()`); the rest rely on service-layer
discipline that does not exist yet.

| Enum | Values (abridged) | Applied to |
|---|---|---|
| RoleName | BUYER, REAL_ESTATE_AGENT, LEGAL_REVIEWER, FINANCIAL_INSTITUTION, ADMINISTRATOR | roles.name |
| PropertyType | RESIDENTIAL, COMMERCIAL, INDUSTRIAL, AGRICULTURAL, MIXED_USE, LAND (+display labels) | property_details.property_type |
| RiskLevel | LOW, MEDIUM, HIGH, UNKNOWN | flood/environmental risk_level |
| ReportStatus | GENERATING, COMPLETED, FAILED | due_diligence_reports.status |
| PaymentStatus | PAID, UNPAID, OVERDUE, PARTIALLY_PAID | tax_details.payment_status |
| PermitStatus / PermitType | PENDING/APPROVED/REJECTED/EXPIRED/COMPLETED · BUILDING/RENOVATION/… | building_permit_details |
| ZoningStatus | COMPLIANT, NON_COMPLIANT, PENDING, … | zoning_details.zoning_status |
| EnvironmentalStatus | CLEAR, FLAGGED, PENDING, NOT_FOUND | environmental_details.status |
| OwnershipVerificationStatus | VERIFIED, NOT_VERIFIED, PARTIALLY_VERIFIED, DISPUTED | risk scoring semantics |
| ComplianceStatus | COMPLIANT, NON_COMPLIANT, PARTIALLY_COMPLIANT, NOT_VERIFIED | scoring semantics |
| AvailabilityStatus | AVAILABLE, NOT_AVAILABLE, UNKNOWN, NOT_VERIFIED | utility_details |
| UtilityType | ELECTRICITY, WATER, GAS, … | utility_details.utility_type |
| ActivityAction / EntityType | CREATE/UPDATE/DELETE/VIEW/SEARCH/DOWNLOAD · USER/PROPERTY/… | activity_logs |

---

## 6. Indexes, Keys & Query Affinity

Hibernate creates only PK + declared unique indexes. Query paths in use and their needs:

| Query (from code) | Table | Supported by |
|---|---|---|
| Login / user lookup by email | users | `U(email)` ✅ |
| Refresh validate by token | refresh_tokens | `U(token)` ✅ |
| Admin user list by role | users | `role_id` FK index ⚠️ (H2 fine; add on Postgres) |
| Properties list + filter city/state/type | property_details | none — full scan ⚠️ |
| All detail rows for one property | 8 fact tables | `property_id` ⚠️ — **add index per table** |
| User's watchlist (scheduler scan) | property_monitoring | `next_check_at` ⚠️ |
| User's notifications (unread first) | notifications | `(user_id, status)` ⚠️ |

Recommended composite index set (PostgreSQL migration time):
`property_details(city, state)`, `property_details(property_type)`, `idx_<fact>.property_id` ×9,
`risk_assessment_details.property_id`, `due_diligence_reports(property_id, status)`,
`market_trends(city, locality, period)` (UNIQUE), `api_logs(service_name, request_time)`,
`activity_logs(user_id, created_at)`.

---

## 7. Data Lifecycle

1. **Auth** — register/login write `users` (+`user_profiles`, `roles` read); refresh rotation writes `refresh_tokens` chains.
2. **Search** (SERVICE_ANALYSIS pipeline): Geocoding v4 → Places details → Mappls text-search fallback →
   `normalize()` gate → INSERT `property_details`. Every search inserts — duplicates accumulate by design today.
3. **Due diligence** (scaffolded, unwired): fetchers would append rows to the 8 fact tables; a scoring run
   inserts `risk_assessment_details`; report generation inserts `due_diligence_reports` + `supporting_docs`.
4. **Monitoring** (scaffolded): `property_monitoring.next_check_at` drives rechecks; drift raises `notifications`;
   each check may pin a `property_history` snapshot.
5. **Observability**: `api_logs` per external call, `activity_logs` per user action. Both write-only, never read.
6. **Restart** (H2 dev): everything except seeds is lost — `create-drop` + `data.sql` re-establishes roles + admin.

---

## 8. Design Gaps & Recommendations

Short-term (before any non-dev deployment):

1. **No persistence profile exists for PostgreSQL** — `application-postgres.properties` referenced in
   comments/docs is missing; add it with `ddl-auto=validate` and real credentials.
2. **No migrations** — with any durable DB, enable Flyway and generate V1 from the current entity model
   (the empty `db/migration/` folder is already in place).
3. **Dual-mapped FK columns lack real FK constraints at query-layer** — they are generated by Hibernate
   from the `@JoinColumn` associations, but the raw `xxx_id` `@Column` definitions do not declare
   `nullable` consistently (e.g. `due_diligence_reports.risk_assessment_id` allows NULL by column but the
   1:1 side expects it). Keep column and association in sync.
4. **Enums unenforced** — either switch string columns to `@Enumerated(EnumType.STRING)` + `@Check`, or
   validate in services when they are written.
5. **No repositories for 18 of 22 entities** — only Property/User/Role/RefreshToken exist; fact, risk,
   report, monitoring, notification and log tables are unreachable from the app today.
6. **Property dedup** — no unique key on `(address(191), postal_code)` or lat/long rounding; search creates
   unbounded duplicate hub rows (Project.md limitation #4).
7. **`market_trends` natural key unenforced** — `(city, locality, period)` should be UNIQUE.
8. **`users.user_id` naming vs inverse `UserProfile.user`** — the mapped-by target exists; fine, but the
   `refresh_tokens.user_id` has no association, so token→user joins are string-matched only.
9. **Retention** — `api_logs`/`activity_logs`/`property_history` are append-only with no archival plan.

---

## 9. Physical Model Summary

- **22 tables** · 9 one-to-many fans off `property_details` · 1 one-to-one (reports↔risk, users↔profiles) ·
  1 polymorphic audit pattern (activity_logs) · 3 unlinked telemetry/aggregate tables (api_logs, market_trends, refresh_tokens-by-column).
- **Storage shape**: OLTP + append-only analytics in one schema; external-data provenance baked into every fact table.
- **Current fidelity**: dev schema is exactly the entity model (Hibernate-generated); nothing in this doc is aspirational.
