# Database — Autonomous Property Research and Real Estate Risk Assessment Intelligence System

This directory contains the PostgreSQL database schema and database-related documentation for the **Autonomous Property Research and Real Estate Risk Assessment Intelligence System** (Infosys Springboard Internship — Team Two).

The database is designed to store users, properties, property due-diligence information, risk assessment results, comparable properties, valuations, reports, notifications, and audit information.

---

## Technology

* **Database:** PostgreSQL
* **ORM:** JPA / Hibernate
* **Backend:** Spring Boot
* **Database Name:** `duediligence_db`

---

# Milestone 1 — Foundation & User Management

### Objective

Milestone 1 establishes the basic database structure for user management, property management, and property address validation.

### Tables

#### 1. `users`

Stores registered users and their roles.

Main fields:

* `id`
* `full_name`
* `email`
* `password`
* `role`
* `created_at`

Supported roles:

* BUYER
* REAL_ESTATE_AGENT
* LEGAL_REVIEWER
* FINANCIAL_INSTITUTION
* ADMINISTRATOR

---

#### 2. `properties`

Stores basic information about properties.

Main fields:

* `id`
* `address`
* `city`
* `state`
* `zip_code`
* `property_type`
* `created_at`

Supported property types:

* RESIDENTIAL
* COMMERCIAL
* INDUSTRIAL
* LAND

---

#### 3. `address_validations`

Stores property address validation information.

This table is associated with the `properties` table.

---

### Milestone 1 Database Flow

```text
User
  ↓
Property
  ↓
Address Validation
```

---

# Milestone 2 — Property Due Diligence Data

### Objective

Milestone 2 stores detailed property due-diligence information required for property research and verification.

### Tables

#### 1. `ownership_records`

Stores ownership history of a property.

Main information:

* Owner name
* Acquired date
* Transfer date
* Property reference

A property can have multiple ownership records.

---

#### 2. `tax_history`

Stores historical property tax information.

Main information:

* Amount paid
* Tax year
* Payment status
* Property reference

Supported statuses:

* PAID
* OVERDUE
* PARTIALLY_PAID

---

#### 3. `zoning_info`

Stores zoning information and zoning compliance for a property.

Main information:

* Zone type
* Compliance status
* Property reference

---

#### 4. `flood_zone_info`

Stores flood-zone information and associated risk level.

Main information:

* Zone
* Risk level
* Property reference

---

#### 5. `permit_records`

Stores property permit information.

Main information:

* Permit type
* Issued date
* Permit status
* Property reference

Supported permit statuses:

* APPROVED
* PENDING
* REJECTED
* EXPIRED

---

#### 6. `environmental_records`

Stores environmental information associated with a property.

---

#### 7. `utility_info`

Stores utility-related information associated with a property.

---

### Milestone 2 Database Flow

```text
Property
   │
   ├── Ownership Records
   ├── Tax History
   ├── Zoning Information
   ├── Flood Zone Information
   ├── Permit Records
   ├── Environmental Records
   └── Utility Information
```

---

# Milestone 3 — Risk Assessment, Reports & Notifications

### Objective

Milestone 3 uses the property due-diligence information collected in Milestone 2 to support risk assessment, comparable property analysis, valuation, report generation, exports, notifications, and audit tracking.

### Tables

#### 1. `risk_assessments`

Stores the overall risk assessment generated for a property.

Main fields:

* `id`
* `property_id`
* `risk_score`
* `overall_risk_level`
* `tax_risk_note`
* `flood_risk_note`
* `zoning_risk_note`
* `permit_risk_note`
* `environmental_risk_note`
* `assessed_at`

Risk score range:

```text
0 — 100
```

Supported overall risk levels:

* LOW
* MEDIUM
* HIGH

---

#### 2. `risk_factors`

Stores individual factors contributing to a property's risk assessment.

Main fields:

* `risk_assessment_id`
* `factor_type`
* `factor_name`
* `risk_level`
* `risk_score`
* `description`
* `created_at`

---

#### 3. `comparable_property_analysis`

Stores comparable properties used for property price comparison and market analysis.

Main fields:

* `property_id`
* `address`
* `price`
* `distance_km`

---

#### 4. `property_valuations`

Stores property valuation results.

Main fields:

* `property_id`
* `valuation_method`
* `estimated_value`
* `min_value`
* `max_value`
* `confidence_score`
* `valuation_date`
* `valuation_status`
* `notes`

---

#### 5. `due_diligence_reports`

Stores generated property due-diligence reports.

Main fields:

* `property_id`
* `risk_assessment_id`
* `report_title`
* `report_status`
* `overall_risk_level`
* `summary`
* `generated_by`
* `generated_at`
* `created_at`
* `updated_at`

---

#### 6. `report_exports`

Stores exported report information such as PDF and Excel exports.

Main fields:

* `report_id`
* `export_format`
* `file_name`
* `file_path`
* `export_status`
* `exported_by`
* `exported_at`

---

#### 7. `notifications`

Stores notifications related to users and completed reports.

Main fields:

* `user_id`
* `notification_type`
* `title`
* `message`
* `is_read`
* `related_entity_type`
* `related_entity_id`
* `created_at`

---

#### 8. `audit_logs`

Stores system activity and audit information.

Main fields:

* `user_id`
* `action`
* `entity_type`
* `entity_id`
* `old_value`
* `new_value`
* `ip_address`
* `created_at`

---

# Milestone 3 Database Flow

```text
Property Due-Diligence Data
          │
          ↓
    Risk Assessment
          │
          ├── Risk Factors
          │
          ↓
Comparable Property Analysis
          │
          ↓
   Property Valuation
          │
          ↓
 Due Diligence Report
          │
          ├── PDF / Excel Export
          │
          ├── Notifications
          │
          └── Audit Logs
```

---

# Database Relationships

The major database relationships are:

```text
users
  │
  ├─────────────── notifications
  │
  ├─────────────── audit_logs
  │
  └─────────────── due_diligence_reports


properties
  │
  ├── address_validations
  ├── ownership_records
  ├── tax_history
  ├── zoning_info
  ├── flood_zone_info
  ├── permit_records
  ├── environmental_records
  ├── utility_info
  ├── risk_assessments
  ├── comparable_property_analysis
  ├── property_valuations
  └── due_diligence_reports


risk_assessments
  │
  └── risk_factors


due_diligence_reports
  │
  └── report_exports
```

---

# Constraints & Data Integrity

The database uses:

* Primary keys for unique record identification
* Foreign keys for table relationships
* `NOT NULL` constraints for mandatory fields
* `UNIQUE` constraints where required
* `CHECK` constraints for valid values and ranges
* `ON DELETE CASCADE` where dependent records should be removed with the parent
* `ON DELETE SET NULL` where historical references should remain after the related record is removed
* Indexes on frequently queried foreign-key columns

---

# Indexing

Indexes are used to improve query performance for frequently searched relationships.

Important indexes include:

```text
idx_risk_assessments_property_id
idx_risk_factors_assessment_id
idx_property_valuations_property_id
idx_due_diligence_reports_property_id
idx_due_diligence_reports_risk_assessment_id
idx_report_exports_report_id
idx_notifications_user_id
idx_audit_logs_user_id
idx_audit_logs_entity
```

---

# Current Milestone Status

| Milestone                                              | Status                   |
| ------------------------------------------------------ | ------------------------ |
| Milestone 1 — Foundation & User Management             | Completed                |
| Milestone 2 — Property Due Diligence Data              | Completed                |
| Milestone 3 — Risk Assessment, Reports & Notifications | Database schema prepared |

### Milestone 3 Note

The Milestone 3 database schema has been added to `schema.sql`.

The final backend entity structures should remain synchronized with the database schema as the backend implementation progresses.

---

# Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE duediligence_db;
```

Connect to the database:

```text
\c duediligence_db
```

To inspect all tables:

```text
\dt
```

To inspect a specific table:

```text
\d table_name
```

Example:

```text
\d properties
\d risk_assessments
\d due_diligence_reports
```

---

# Project Database Responsibility

The database layer is responsible for:

* Designing relational database tables
* Maintaining primary and foreign-key relationships
* Maintaining data integrity constraints
* Creating indexes for frequently accessed data
* Supporting property due-diligence workflows
* Supporting Milestone 3 risk assessment and reporting
* Keeping the database schema synchronized with backend entities

---

## Milestone Summary

```text
Milestone 1
    ↓
Users + Properties + Address Validation
    ↓
Milestone 2
    ↓
Ownership + Tax + Zoning + Flood + Permits
+ Environmental + Utility
    ↓
Milestone 3
    ↓
Risk Assessment + Comparable Analysis
+ Valuation + Reports + Exports
+ Notifications + Audit Logs
```

The database provides the persistent data layer for the complete property research and real-estate risk assessment workflow.
