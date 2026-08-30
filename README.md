# real-estate-due-diligence-agent
Java-based Real Estate Due Diligence Agent for automating property document analysis, risk identification, and due diligence reporting.

# Member 4: Backend & External Data Integration — Daily Tasks & Git Documentation
**Project:** Java-based Real Estate Due Diligence Agent  
**Branch:** `member4-backend-external-data`  
**Role:** Backend Developer (Property Management, Search Engine, Address Validation & External Data)

---

## 📅 Day 1: Project Setup, Branching & Environment Configuration

### 🎯 Objective
Set up the developer workspace, create the dedicated feature branch, configure database connections (MySQL on port 3307), and verify core Spring Boot dependencies.

### 💻 Git Commands Executed
```bash
# 1. Ensure local repository is up-to-date with main
git checkout main
git pull origin main

# 2. Create and switch to Member 4's feature branch
git checkout -b member4-backend-external-data

# 3. Verify current branch
git branch
```

### 🛠️ Key Work Done
* Created branch `member4-backend-external-data`.
* Configured `pom.xml` with dependencies:
  * `spring-boot-starter-data-jpa`
  * `spring-boot-starter-webmvc`
  * `spring-boot-starter-validation`
  * `spring-boot-starter-security`
  * `mysql-connector-j` (MySQL JDBC Driver)
  * `lombok`
* Configured `src/main/resources/application.properties` for MySQL connection on port `3307`:
  * Database: `real_estate`
  * Username: `root`
  * DDL auto: `update`
  * SQL logging enabled.

---

## 📅 Day 2: JPA Entity Design & Database Schema Modeling

### 🎯 Objective
Design normalized database entities representing properties and historical transaction/price events with indexing for optimized search performance.

### 💻 Git Commands Executed
```bash
git add src/main/java/com/realestate/backend/entity/
git commit -m "feat(entity): create Property and PropertyHistory JPA entities with indexing"
```

### 🛠️ Key Work Done
* **Created `Property.java` (`src/main/java/com/realestate/backend/entity/Property.java`):**
  * Fields: `id`, `title`, `address`, `city`, `state`, `zipCode`, `country`, `price`, `bedrooms`, `bathrooms`, `squareFeet`, `propertyType`, `yearBuilt`, `description`, `status`, `createdAt`, `updatedAt`.
  * Multi-column indexes on `city`, `state`, `zip_code`, `property_type`, and `status`.
  * Lombok annotations: `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`.
* **Created `PropertyHistory.java` (`src/main/java/com/realestate/backend/entity/PropertyHistory.java`):**
  * `@ManyToOne` relationship with `Property`.
  * Tracks historical events: `LISTED`, `PRICE_CHANGED`, `STATUS_CHANGED`.

---

## 📅 Day 3: Data Access Layer & Multi-Criteria Search Repository

### 🎯 Objective
Build Spring Data JPA Repositories and custom JPQL queries to support flexible, multi-parameter search filtering.

### 💻 Git Commands Executed
```bash
git add src/main/java/com/realestate/backend/repository/
git commit -m "feat(repository): implement PropertyRepository with JPQL multi-filter search and PropertyHistoryRepository"
```

### 🛠️ Key Work Done
* **Created `PropertyRepository.java` (`src/main/java/com/realestate/backend/repository/PropertyRepository.java`):**
  * Custom JPQL query for dynamic search across:
    * Keyword query (matching `title`, `address`, or `city`)
    * City, State, Zip Code
    * Property Type
    * Price Range (`minPrice` to `maxPrice`)
    * Minimum Bedrooms & Bathrooms
    * Status (`AVAILABLE`, `PENDING`, `SOLD`)
* **Created `PropertyHistoryRepository.java` (`src/main/java/com/realestate/backend/repository/PropertyHistoryRepository.java`):**
  * `findByPropertyId(Long propertyId, Sort sort)` to fetch chronological history.

---

## 📅 Day 4: DTOs, Service Layer & Business Logic Implementation

### 🎯 Objective
Implement Data Transfer Objects (DTOs), business logic services, price-change auto-detection, and centralized error handling.

### 💻 Git Commands Executed
```bash
git add src/main/java/com/realestate/backend/dto/
git add src/main/java/com/realestate/backend/service/
git add src/main/java/com/realestate/backend/exception/
git commit -m "feat(service): implement PropertyService, DTOs, price tracking logic, and GlobalExceptionHandler"
```

### 🛠️ Key Work Done
* **DTO Layer:**
  * `PropertyRequestDTO`: Validated input with `@NotBlank`, `@Positive`, `@Min`.
  * `PropertyResponseDTO`: Clean presentation model.
  * `PropertySearchCriteriaDTO`: Encapsulated filter parameters.
  * `PropertyHistoryDTO`: Historical timeline records.
  * `ApiResponse<T>`: Standard response envelope (`success`, `message`, `data`, `timestamp`).
* **Service Layer:**
  * `PropertyService` & `PropertyServiceImpl`:
    * CRUD operations for properties.
    * Automatically generates `PropertyHistory` when price changes during update.
    * Executes criteria search and maps results to response DTOs.
* **Exception Handling:**
  * `GlobalExceptionHandler`, `ResourceNotFoundException`, `BadRequestException`.

---

## 📅 Day 5: External Data Integration — Address Validation Service

### 🎯 Objective
Create the Address Validation module to standardize and verify user-submitted addresses before property listing.

### 💻 Git Commands Executed
```bash
git add src/main/java/com/realestate/backend/service/AddressValidationService*
git add src/main/java/com/realestate/backend/controller/AddressValidationController*
git add src/test/java/com/realestate/backend/service/AddressValidationServiceTest*
git commit -m "feat(external-data): implement AddressValidationService, controller, and unit tests"
```

### 🛠️ Key Work Done
* Created `AddressValidationRequestDTO` and `AddressValidationResponseDTO`.
* Implemented `AddressValidationServiceImpl`:
  * Validates completeness (street, city, state, postal code).
  * Computes validation score (0.0 to 1.0) and flag `isValid`.
  * Returns standardized uppercase address string and breakdown components.
* Created `AddressValidationController` with endpoint `POST /api/address/validate`.
* Added unit tests in `AddressValidationServiceTest.java`.

---

## 📅 Day 6: REST Controller Endpoints, Security & Postman Verification

### 🎯 Objective
Expose RESTful APIs, configure Spring Security/CORS, test APIs with Postman, and document collection.

### 💻 Git Commands Executed
```bash
git add src/main/java/com/realestate/backend/controller/
git add src/main/java/com/realestate/backend/config/
git add docs/postman_collection.json
git commit -m "feat(api): expose Property REST controllers, configure security, and export Postman collection"
```

### 🛠️ Key Work Done
* **Created `PropertyController.java` (`src/main/java/com/realestate/backend/controller/PropertyController.java`):**
  * `POST   /api/properties` - Create Property
  * `GET    /api/properties` - Get All Properties
  * `GET    /api/properties/{id}` - Get Property by ID
  * `PUT    /api/properties/{id}` - Update Property
  * `DELETE /api/properties/{id}` - Delete Property
  * `GET    /api/properties/search` - Multi-filter Property Search
  * `GET    /api/properties/{id}/history` - Get Property Price & Event History
  * `POST   /api/properties/{id}/history` - Add Manual History Event
* **Configured `SecurityConfig.java` (`src/main/java/com/realestate/backend/config/SecurityConfig.java`):**
  * Permitted public access for `/api/properties/**` and `/api/address/**`.
  * Disabled CSRF for REST stateless communication.
  * Configured CORS (`*`).
* **Postman Collection:** Exported `docs/postman_collection.json` containing 9 comprehensive test requests.

---

## 🚀 Final Steps: Pushing to Remote & Pull Request (PR)

When ready to submit your work to the team lead:

```bash
# 1. Check current status
git status

# 2. Stage all modifications
git add .

# 3. Commit the final changes
git commit -m "feat(member-4): complete backend external data, property search, and address validation"

# 4. Push to remote branch
git push -u origin member4-backend-external-data
```

