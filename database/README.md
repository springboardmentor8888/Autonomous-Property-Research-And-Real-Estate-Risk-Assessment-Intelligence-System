# Database — Real Estate Due Diligence Agent

PostgreSQL database for the **Autonomous Property Research and Real Estate Risk Assessment Intelligence System** (Infosys Springboard Internship — Team Two).

## Overview

The database stores and manages information related to:

* User management and roles
* Property information
* Address validation

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
* AGENT
* LEGAL_REVIEWER
* BANK
* ADMIN

### 2. users

Stores user account information.

| Column   | Data Type    | Description                        |
| -------- | ------------ | ---------------------------------- |
| id       | BIGSERIAL    | Primary Key                        |
| name     | VARCHAR(100) | User name                          |
| email    | VARCHAR(150) | Unique email                       |
| password | VARCHAR(255) | User password                      |
| phone    | VARCHAR(20)  | User phone number                  |
| role_id  | BIGINT       | Foreign Key referencing `roles.id` |

### 3. properties

Stores property details.

| Column        | Data Type    | Description      |
| ------------- | ------------ | ---------------- |
| id            | BIGSERIAL    | Primary Key      |
| address       | VARCHAR(255) | Property address |
| city          | VARCHAR(100) | City             |
| state         | VARCHAR(100) | State            |
| postal_code   | VARCHAR(20)  | Postal/ZIP code  |
| country       | VARCHAR(100) | Country          |
| property_type | VARCHAR(50)  | Type of property |

### 4. address_validations

Stores address validation information for properties.

| Column            | Data Type    | Description                             |
| ----------------- | ------------ | --------------------------------------- |
| id                | BIGSERIAL    | Primary Key                             |
| property_id       | BIGINT       | Foreign Key referencing `properties.id` |
| submitted_address | VARCHAR(255) | Address submitted for validation        |
| validated_address | VARCHAR(255) | Address returned after validation       |
| is_valid          | BOOLEAN      | Indicates whether the address is valid  |
| validation_source | VARCHAR(100) | Source used for validation              |

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

## SQL Files

* `schema.sql` — Creates the database tables and relationships.
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

The database schema will be extended in future milestones as additional project features are developed.

