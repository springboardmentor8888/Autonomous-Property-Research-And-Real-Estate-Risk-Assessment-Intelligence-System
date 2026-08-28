# Database — Real Estate Due Diligence Agent

PostgreSQL database for the **Autonomous Property Research and Real Estate Risk Assessment Intelligence System** (Infosys Springboard Internship — Team Two).

## Overview

The database stores and manages information related to:

* User management and role-based access
* Property information
* Address validation
* Relationships between users, roles, properties, and address validations

## Technology Stack

* PostgreSQL
* SQL

## Database Tables

### 1. roles

Stores the different roles available in the system.

| Column    | Data Type   | Description      |
| --------- | ----------- | ---------------- |
| id        | BIGSERIAL   | Primary Key      |
| role_name | VARCHAR(50) | Unique role name |

Default roles:

* BUYER
* REAL_ESTATE_AGENT
* LEGAL_REVIEWER
* FINANCIAL_INSTITUTION
* ADMINISTRATOR

### 2. users

Stores user account information and associates each user with a system role.

| Column        | Data Type    | Description                        |
| ------------- | ------------ | ---------------------------------- |
| id            | BIGSERIAL    | Primary Key                        |
| full_name     | VARCHAR(100) | User's full name                   |
| email         | VARCHAR(150) | Unique email address               |
| password_hash | VARCHAR(255) | Hashed user password               |
| role_id       | BIGINT       | Foreign Key referencing `roles.id` |
| created_at    | TIMESTAMP    | Account creation timestamp         |

### 3. properties

Stores property information used for property search and due diligence.

| Column        | Data Type    | Description                 |
| ------------- | ------------ | --------------------------- |
| id            | BIGSERIAL    | Primary Key                 |
| address       | VARCHAR(255) | Property address            |
| city          | VARCHAR(100) | City                        |
| state         | VARCHAR(100) | State                       |
| zip_code      | VARCHAR(20)  | ZIP/postal code             |
| property_type | VARCHAR(50)  | Type of property            |
| created_at    | TIMESTAMP    | Property creation timestamp |

### 4. address_validations

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
roles
  │
  └── users
        │
        └── role_id → roles.id

properties
  │
  └── address_validations
        │
        └── property_id → properties.id
```

### Relationship Details

* Each user is assigned one role through `users.role_id`.
* `users.role_id` references `roles.id`.
* Each address validation belongs to a property through `address_validations.property_id`.
* `address_validations.property_id` references `properties.id`.

## API Contract Mapping

The database fields are designed to support the API contract defined in `docs/api-contract.md`.

| API Field      | Database Field                               |
| -------------- | -------------------------------------------- |
| `fullName`     | `users.full_name`                            |
| `email`        | `users.email`                                |
| `password`     | `users.password_hash`                        |
| `role`         | `roles.role_name` through `users.role_id`    |
| `id`           | `users.id` / `properties.id`                 |
| `zipCode`      | `properties.zip_code`                        |
| `propertyType` | `properties.property_type`                   |
| `createdAt`    | `users.created_at` / `properties.created_at` |

## SQL Files

* `schema.sql` — Creates the database tables, primary keys, foreign keys, and relationships.
* `seed.sql` — Inserts the default system roles.

## Setup

1. Create a PostgreSQL database.
2. Run `schema.sql` to create the tables.
3. Run `seed.sql` to insert the default roles.

Example:

```sql
\i database/schema.sql
\i database/seed.sql
```

## Milestone 1

The current database schema supports the Milestone 1 requirements:

* Authentication and user management
* Role-based access
* Property information
* Property search
* Address validation

The database schema will be extended in future milestones as additional project features are implemented.
