# API Contract Specification
## Real Estate Due Diligence Agent

| | |
|---|---|
| **Project** | Autonomous Property Research and Real Estate Risk Assessment Intelligence System |
| **Team** | Team Two |
| **Document Version** | 1.0 |
| **Status** | Draft — Milestones 1–4 |
| **Base URL (Development)** | `http://localhost:8080/api` |

---

## 1. Purpose

This document defines the contract between the backend, frontend, and database components of the system. It specifies endpoint paths, HTTP methods, request/response schemas, status codes, and data ownership for each module across all four project milestones. All implementations must conform to this specification.

---

## 2. Conventions

### 2.1 Naming
All JSON field names use camelCase.

### 2.2 Date and Time Format
ISO 8601, e.g. `2026-08-27T14:30:00Z`

### 2.3 Response Envelope

Success:
```json
{
  "success": true,
  "data": { },
  "message": "string (optional)"
}
```

Error:
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

### 2.4 HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Successful GET/PUT request |
| 201 | Resource created successfully |
| 400 | Bad request / validation failure |
| 401 | Missing or invalid authentication token |
| 403 | Authenticated but insufficient role permissions |
| 404 | Resource not found |
| 500 | Internal server error |

### 2.5 Authentication

All protected endpoints require the following header:
```
Authorization: Bearer <jwt-token>
```

### 2.6 Role Enumeration

```
BUYER
REAL_ESTATE_AGENT
LEGAL_REVIEWER
FINANCIAL_INSTITUTION
ADMINISTRATOR
```

### 2.7 Risk Level Enumeration

```
LOW
MEDIUM
HIGH
```

### 2.8 Component Ownership Key

| Symbol | Component |
|---|---|
| BE | Backend |
| FE | Frontend |
| DB | Database |

---

## 3. Milestone 1 — Authentication, User Management, Property Search

**Component ownership:** BE implements endpoints 3.1–3.4. FE consumes endpoints 3.1–3.4 for the Register, Login, and Dashboard views. DB implements schema in Section 3.5.

### 3.1 Register User

| | |
|---|---|
| Method | POST |
| Path | `/auth/register` |
| Auth required | No |

Request body:
```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "role": "BUYER | REAL_ESTATE_AGENT | LEGAL_REVIEWER | FINANCIAL_INSTITUTION | ADMINISTRATOR"
}
```

Response `201`:
```json
{
  "success": true,
  "data": {
    "id": "number",
    "fullName": "string",
    "email": "string",
    "role": "string"
  },
  "message": "Registration successful"
}
```

### 3.2 Login

| | |
|---|---|
| Method | POST |
| Path | `/auth/login` |
| Auth required | No |

Request body:
```json
{
  "email": "string",
  "password": "string"
}
```

Response `200`:
```json
{
  "success": true,
  "data": {
    "token": "string",
    "user": {
      "id": "number",
      "fullName": "string",
      "email": "string",
      "role": "string"
    }
  }
}
```

### 3.3 Get Current Authenticated User

| | |
|---|---|
| Method | GET |
| Path | `/auth/me` |
| Auth required | Yes |

Response `200`:
```json
{
  "success": true,
  "data": {
    "id": "number",
    "fullName": "string",
    "email": "string",
    "role": "string"
  }
}
```

### 3.4 Property Search

| | |
|---|---|
| Method | GET |
| Path | `/properties/search` |
| Query params | `address` (string) |
| Auth required | Yes |

Response `200`:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "address": "string",
      "city": "string",
      "state": "string",
      "zipCode": "string",
      "propertyType": "string"
    }
  ]
}
```

### 3.5 Database Schema — Milestone 1

```
users
  id            PK
  full_name
  email         unique
  password_hash
  role
  created_at

properties
  id            PK
  address
  city
  state
  zip_code
  property_type
  created_at
```

---

## 4. Milestone 2 — Property Data Aggregation

**Component ownership:** BE implements endpoints 4.1–4.5. FE consumes endpoints 4.1–4.5 for the Property Detail view. DB implements schema in Section 4.6.

### 4.1 Get Property Details

| | |
|---|---|
| Method | GET |
| Path | `/properties/{propertyId}` |
| Auth required | Yes |

Response `200`:
```json
{
  "success": true,
  "data": {
    "id": "number",
    "address": "string",
    "ownership": {
      "ownerName": "string",
      "acquiredDate": "date"
    },
    "taxHistory": [
      { "year": "number", "amountPaid": "number", "status": "string" }
    ],
    "zoning": {
      "zoneType": "string",
      "compliant": "boolean"
    },
    "floodZone": {
      "zone": "string",
      "riskLevel": "string"
    },
    "permits": [
      { "permitType": "string", "status": "string", "issuedDate": "date" }
    ]
  }
}
```

### 4.2 Get Tax History

| | |
|---|---|
| Method | GET |
| Path | `/properties/{propertyId}/tax-history` |
| Auth required | Yes |

### 4.3 Get Zoning Information

| | |
|---|---|
| Method | GET |
| Path | `/properties/{propertyId}/zoning` |
| Auth required | Yes |

### 4.4 Get Flood Zone Information

| | |
|---|---|
| Method | GET |
| Path | `/properties/{propertyId}/flood-zone` |
| Auth required | Yes |

### 4.5 Get Permit Records

| | |
|---|---|
| Method | GET |
| Path | `/properties/{propertyId}/permits` |
| Auth required | Yes |

### 4.6 Database Schema — Milestone 2

```
ownership_records
  property_id   FK
  owner_name
  acquired_date

tax_history
  property_id   FK
  year
  amount_paid
  status

zoning_info
  property_id   FK
  zone_type
  compliant

flood_zone_info
  property_id   FK
  zone
  risk_level

permit_records
  property_id   FK
  permit_type
  status
  issued_date
```

---

## 5. Milestone 3 — Risk Assessment, Reporting, Notifications

**Component ownership:** BE implements endpoints 5.1–5.5. FE consumes endpoints 5.1–5.5 for the Risk/Report view, Comparables section, and Notifications panel. DB implements schema in Section 5.6.

### 5.1 Get Risk Assessment

| | |
|---|---|
| Method | GET |
| Path | `/properties/{propertyId}/risk-assessment` |
| Auth required | Yes |

Response `200`:
```json
{
  "success": true,
  "data": {
    "propertyId": "number",
    "riskScore": "number",
    "riskLevel": "LOW | MEDIUM | HIGH",
    "factors": {
      "taxRisk": "string",
      "floodRisk": "string",
      "zoningRisk": "string",
      "permitRisk": "string"
    }
  }
}
```

### 5.2 Get Comparable Properties

| | |
|---|---|
| Method | GET |
| Path | `/properties/{propertyId}/comparables` |
| Auth required | Yes |

Response `200`:
```json
{
  "success": true,
  "data": [
    { "id": "number", "address": "string", "price": "number", "distanceKm": "number" }
  ]
}
```

### 5.3 Generate Due Diligence Report

| | |
|---|---|
| Method | POST |
| Path | `/properties/{propertyId}/reports` |
| Auth required | Yes |

Response `201`:
```json
{
  "success": true,
  "data": {
    "reportId": "string",
    "propertyId": "number",
    "generatedAt": "datetime",
    "downloadUrlPdf": "string",
    "downloadUrlExcel": "string"
  }
}
```

### 5.4 Download Report

| | |
|---|---|
| Method | GET |
| Path | `/reports/{reportId}/pdf` |
| Auth required | Yes |
| Response type | Binary file |

| | |
|---|---|
| Method | GET |
| Path | `/reports/{reportId}/excel` |
| Auth required | Yes |
| Response type | Binary file |

### 5.5 Get Notifications

| | |
|---|---|
| Method | GET |
| Path | `/notifications` |
| Auth required | Yes |

Response `200`:
```json
{
  "success": true,
  "data": [
    {
      "id": "number",
      "type": "string",
      "message": "string",
      "read": "boolean",
      "createdAt": "datetime"
    }
  ]
}
```

### 5.6 Database Schema — Milestone 3

```
risk_assessments
  property_id   FK
  risk_score
  risk_level
  tax_risk
  flood_risk
  zoning_risk
  permit_risk

reports
  id            PK
  property_id   FK
  generated_at
  pdf_path
  excel_path

notifications
  id            PK
  user_id       FK
  type
  message
  is_read
  created_at
```

---

## 6. Milestone 4 — Administration, Auditing, Deployment

**Component ownership:** BE implements endpoints 6.1–6.3. FE consumes endpoints 6.1–6.2 for the Admin dashboard. DB implements schema in Section 6.4.

### 6.1 List All Users

| | |
|---|---|
| Method | GET |
| Path | `/admin/users` |
| Auth required | Yes — role: ADMINISTRATOR |

### 6.2 Get Audit Logs

| | |
|---|---|
| Method | GET |
| Path | `/admin/audit-logs` |
| Auth required | Yes — role: ADMINISTRATOR |

Response `200`:
```json
{
  "success": true,
  "data": [
    { "id": "number", "userId": "number", "action": "string", "timestamp": "datetime" }
  ]
}
```

### 6.3 Health Check

| | |
|---|---|
| Method | GET |
| Path | `/health` |
| Auth required | No |

Response `200`:
```json
{ "status": "UP" }
```

### 6.4 Database Schema — Milestone 4

```
audit_logs
  id            PK
  user_id       FK
  action
  timestamp
```

---

## 7. Endpoint Index

| Milestone | Method | Path | Owner |
|---|---|---|---|
| 1 | POST | /auth/register | BE, FE |
| 1 | POST | /auth/login | BE, FE |
| 1 | GET | /auth/me | BE, FE |
| 1 | GET | /properties/search | BE, FE |
| 2 | GET | /properties/{id} | BE, FE |
| 2 | GET | /properties/{id}/tax-history | BE |
| 2 | GET | /properties/{id}/zoning | BE |
| 2 | GET | /properties/{id}/flood-zone | BE |
| 2 | GET | /properties/{id}/permits | BE |
| 3 | GET | /properties/{id}/risk-assessment | BE, FE |
| 3 | GET | /properties/{id}/comparables | BE, FE |
| 3 | POST | /properties/{id}/reports | BE, FE |
| 3 | GET | /reports/{id}/pdf | BE, FE |
| 3 | GET | /reports/{id}/excel | BE, FE |
| 3 | GET | /notifications | BE, FE |
| 4 | GET | /admin/users | BE, FE |
| 4 | GET | /admin/audit-logs | BE, FE |
| 4 | GET | /health | BE |

---

## 8. Change Control

Amendments to this specification require an update to this document prior to implementation. Field renames, schema changes, or response structure modifications made outside this process are considered non-conformant and subject to revision.

---

## 9. Revision History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-08-27 | Initial specification covering Milestones 1–4 |
