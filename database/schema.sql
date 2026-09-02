CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);


CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
);


CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    property_type VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE address_validations (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    submitted_address VARCHAR(255) NOT NULL,
    validated_address VARCHAR(255),
    is_valid BOOLEAN NOT NULL,
    validation_source VARCHAR(100),

    CONSTRAINT fk_address_validation_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
);
