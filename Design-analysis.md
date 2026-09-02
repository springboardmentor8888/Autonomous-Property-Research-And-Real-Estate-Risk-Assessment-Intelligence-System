# Design Analysis – Milestone 1

## Overview

Milestone 1 focuses on establishing the core foundation of the Real Estate Due Diligence Agent. The primary objective is to build the basic system structure, user management, property search functionality, and backend architecture that will support future milestones.

---

## Scope of Milestone 1

### Included Features

- User Registration
- User Login
- Role-Based Access Control (RBAC)
- Property Search
- Property Details Retrieval
- Basic Dashboard
- Database Integration
- Design Pattern Implementation

### Excluded Features

- Advanced Risk Assessment
- AI-Based Analysis
- Full Due Diligence Report Generation
- Notification Services
- Market Trend Analytics
- Advanced Property Comparison

These features will be implemented in later milestones.

---

## Architecture Design

Milestone 1 follows a 3-Tier Architecture.

```text
Presentation Layer
       │
       ▼
Business Logic Layer
       │
       ▼
Data Access Layer
       │
       ▼
PostgreSQL Database
```

---

## Presentation Layer

### Components

- Login Page
- Registration Page
- Dashboard
- Property Search Page
- Property Details Page

### Technologies

- ReactJS
- Next.js
- Tailwind CSS

### Responsibilities

- User Authentication Screens
- Property Search Interface
- Property Information Display
- API Communication

---

## Business Logic Layer

### Authentication Module

Responsibilities:

- User Registration
- User Login
- JWT Token Generation
- Role Validation

### User Management Module

Responsibilities:

- User Profile Management
- Role Assignment

### Property Search Module

Responsibilities:

- Property Search
- Address Validation Integration
- Property Data Retrieval

### API Integration Module

Responsibilities:

- External API Communication
- Data Normalization
- Error Handling

---

## Data Access Layer

### Database

PostgreSQL

### Core Tables

#### Users

```text
id
name
email
password
role
```

#### Properties

```text
id
address
city
state
zipcode
```

---

## Design Patterns Used

### Repository Pattern

Used to separate database operations from business logic.

Repositories:

- UserRepository
- PropertyRepository

### DTO Pattern

Used for request and response communication between frontend and backend.

Examples:

- LoginRequestDTO
- LoginResponseDTO
- PropertyResponseDTO

### Singleton Pattern

Used for application configuration and Spring-managed services.

### Strategy Pattern (Initial Structure)

Prepared for future Risk Assessment implementation.

---

## API Design

### Authentication APIs

```http
POST /api/auth/register
POST /api/auth/login
```

### Property APIs

```http
GET /api/properties
GET /api/properties/{id}
```

### Health Check API

```http
GET /api/health
```

---

## Security Design

### Authentication

- JWT Authentication
- BCrypt Password Encryption

### Authorization

- Role-Based Access Control

Roles:

- User
- Admin

---

## Project Structure

```text
src/main/java/com/realestate

├── controller
├── service
├── repository
├── entity
├── dto
├── config
├── security
└── patterns
```

---

## Milestone 1 Deliverables

- Spring Boot Project Setup
- React Frontend Setup
- PostgreSQL Database Setup
- Property Search Module
- Basic Dashboard
- Repository Pattern Implementation

---

## Conclusion

Milestone 1 establishes the core architecture, authentication system, database integration, and property search capabilities. It provides a stable foundation for future milestones involving due diligence analysis, risk assessment, report generation, notifications, and advanced analytics.
