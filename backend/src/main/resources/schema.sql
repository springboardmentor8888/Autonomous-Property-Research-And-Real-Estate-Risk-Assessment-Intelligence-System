CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS properties (
    id BIGSERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    property_type VARCHAR(50),
    parcel_id VARCHAR(100),
    owner_name VARCHAR(150),
    acquired_date DATE,
    zone_type VARCHAR(100),
    zone_compliant BOOLEAN,
    flood_zone VARCHAR(100),
    flood_risk_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS address_validations (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT,
    submitted_address VARCHAR(255) NOT NULL,
    validated_address VARCHAR(255),
    is_valid BOOLEAN NOT NULL,
    validation_source VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS risk_assessments (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    risk_score INT NOT NULL,
    risk_level VARCHAR(50) NOT NULL,
    tax_risk VARCHAR(255),
    flood_risk VARCHAR(255),
    zoning_risk VARCHAR(255),
    permit_risk VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(100) PRIMARY KEY,
    property_id BIGINT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_path VARCHAR(255),
    excel_path VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS tax_history (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    tax_year INT,
    amount_paid DOUBLE PRECISION,
    status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS permit_records (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    permit_type VARCHAR(100),
    status VARCHAR(50),
    issued_date DATE
);

CREATE TABLE IF NOT EXISTS comparable_properties (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    address VARCHAR(255),
    price DOUBLE PRECISION,
    distance_km DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    type VARCHAR(50),
    message VARCHAR(550) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
