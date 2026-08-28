CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);



CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id BIGINT NOT NULL,
    
    FOREIGN KEY (role_id) REFERENCES roles(id)
);



CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    property_type VARCHAR(50)
);



CREATE TABLE address_validations (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    submitted_address VARCHAR(255) NOT NULL,
    validated_address VARCHAR(255),
    is_valid BOOLEAN NOT NULL,
    validation_source VARCHAR(100),
    
    FOREIGN KEY (property_id) REFERENCES properties(id)
);