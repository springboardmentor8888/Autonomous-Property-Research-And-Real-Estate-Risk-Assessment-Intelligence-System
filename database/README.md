# Database — Real Estate Due Diligence Agent

PostgreSQL database for the **Autonomous Property Research and Real Estate Risk Assessment Intelligence System** (Infosys Springboard Internship — Team Two).

## Overview

The database stores and manages information related to:

* User management and authentication
* Role-based access control
* Property information
* Address validation
* Relationships between properties and address validations

User roles and property types are managed using Java enums in the backend and stored as string values in PostgreSQL.

## Technology Stack

* PostgreSQL
* SQL

## Database Tables

### 1. users

Stores user account information, authentication details, and the role assigned to each user.

| Column     | Data Type    | Description                 |
| ---------- | ------------ | --------------------------- |
| id         | BIGSERIAL    | Primary Key                 |
| full_name  | VARCHAR(255) | User's full name            |
| email      | VARCHAR(255) | Unique email address        |
| password   | VARCHAR(255) | BCrypt hashed user password |
| role       | VARCHAR(50)  | User role                   |
| created_at | TIMESTAMP    | Account creation timestamp  |

### Supported User Roles

The following roles are defined in the backend `Role` enum:

* BUYER
* REAL_ESTATE_AGENT
* LEGAL_REVIEWER
* FINANCIAL_INSTITUTION
* ADMINISTRATOR

The `role` value is stored directly in the `users` table. There is no separate `roles` table.

### 2. properties

Stores property information used for property search and due diligence.

| Column        | Data Type    | Description                 |
| ------------- | ------------ | --------------------------- |
| id            | BIGSERIAL    | Primary Key                 |
| address       | VARCHAR(255) | Property address            |
| city          | VARCHAR(255) | City                        |
| state         | VARCHAR(255) | State                       |
| zip_code      | VARCHAR(255) | ZIP/postal code             |
| property_type | VARCHAR(50)  | Type of property            |
| created_at    | TIMESTAMP    | Property creation timestamp |

### Supported Property Types

The following property types are defined in the backend `PropertyType` enum:

* RESIDENTIAL
* COMMERCIAL
* INDUSTRIAL
* LAND

The `property_type` value is stored as a string in the database.

### 3. address_validations

Stores address validation information associated with properties.

| Column            | Data Type    | Description                             |
| ----------------- | ------------ | --------------------------------------- |
| id                | BIGSERIAL    | Primary Key                             |
| property_id       | BIGINT       | Foreign Key referencing `properties.id` |
| submitted_address | VARCHAR(255) | Address submitted for validation        |
| validated_address | VARCHAR(255) | Address returned after validation       |
| is_valid          | BOOLEAN      | Indicates whether the address is valid  |
| validation_source | VARCHAR(100) | Source used for address validation      |

## Relationships

```text
properties
    │
    └── address_validations
            │
            └── property_id → properties.id
```

### Relationship Description

* One property can have multiple address validation records.
* Each address validation record belongs to one property.
* `address_validations.property_id` is a foreign key referencing `properties.id`.

## Database Structure

```text
users
 ├── id (PK)
 ├── full_name
 ├── email (UNIQUE)
 ├── password
 ├── role
 └── created_at

properties
 ├── id (PK)
 ├── address
 ├── city
 ├── state
 ├── zip_code
 ├── property_type
 └── created_at

address_validations
 ├── id (PK)
 ├── property_id (FK → properties.id)
 ├── submitted_address
 ├── validated_address
 ├── is_valid
 └── validation_source
```

## Security

* User passwords are stored as **BCrypt hashed passwords**.
* Email addresses are unique in the `users` table.
* Role-based access control is handled by the backend using the defined Java `Role` enum.
* Sensitive authentication information is not stored in plain text.

## Project Integration

The PostgreSQL database is integrated with the **Spring Boot backend** using Spring Data JPA.

The database supports the backend modules for:

* User registration
* User authentication
* JWT-based authorization
* Role-based access control
* Property search
* Property information management
* Address validation

## Project Structure

```text
database/
├── README.md
├── schema.sql
├── seed.sql
└── migrations/
```

## Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE real_estate_db;
```

Connect to the database:

```bash
psql -U postgres -d real_estate_db
```

Run the schema:

```sql
\i database/schema.sql
```

Run the seed data if required:

```sql
\i database/seed.sql
```

## Team

**Infosys Springboard Internship — Team Two**

Project: **Autonomous Property Research and Real Estate Risk Assessment Intelligence System**
