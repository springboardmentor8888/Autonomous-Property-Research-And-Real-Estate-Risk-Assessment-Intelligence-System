-- ============================================
-- MILESTONE 1
-- ============================================

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_user_role
        CHECK (
            role IN (
                'BUYER',
                'REAL_ESTATE_AGENT',
                'LEGAL_REVIEWER',
                'FINANCIAL_INSTITUTION',
                'ADMINISTRATOR'
            )
        )
);


CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(255) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_property_type
        CHECK (
            property_type IN (
                'RESIDENTIAL',
                'COMMERCIAL',
                'INDUSTRIAL',
                'LAND'
            )
        )
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




-- ============================================
-- MILESTONE 2
-- ============================================



-- OWNERSHIP RECORDS

CREATE TABLE ownership_records (
    id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    owner_name VARCHAR(255) NOT NULL,

    acquired_date DATE NOT NULL,

    CONSTRAINT fk_ownership_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE
);



-- TAX HISTORY

CREATE TABLE tax_history (
    id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    year INTEGER NOT NULL,

    amount_paid NUMERIC(15, 2) NOT NULL,

    status VARCHAR(50) NOT NULL,

    CONSTRAINT fk_tax_history_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_tax_status
        CHECK (
            status IN (
                'PAID',
                'OVERDUE',
                'PARTIALLY_PAID'
            )
        )
);



-- ZONING INFORMATION

CREATE TABLE zoning_info (
    id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    zone_type VARCHAR(255) NOT NULL,

    compliant BOOLEAN NOT NULL,

    CONSTRAINT fk_zoning_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE
);



-- FLOOD ZONE INFORMATION

CREATE TABLE flood_zone_info (
    id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    zone VARCHAR(100) NOT NULL,

    risk_level VARCHAR(50) NOT NULL,

    CONSTRAINT fk_flood_zone_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_flood_risk_level
        CHECK (
            risk_level IN (
                'LOW',
                'MEDIUM',
                'HIGH'
            )
        )
);



-- PERMIT RECORDS


CREATE TABLE permit_records (
    id BIGSERIAL PRIMARY KEY,

    property_id BIGINT NOT NULL,

    permit_type VARCHAR(255) NOT NULL,

    status VARCHAR(50) NOT NULL,

    issued_date DATE NOT NULL,

    CONSTRAINT fk_permit_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_permit_status
        CHECK (
            status IN (
                'APPROVED',
                'PENDING',
                'REJECTED',
                'EXPIRED'
            )
        )
);



-- INDEXES


CREATE INDEX idx_ownership_property_id
ON ownership_records(property_id);

CREATE INDEX idx_tax_history_property_id
ON tax_history(property_id);

CREATE INDEX idx_zoning_property_id
ON zoning_info(property_id);

CREATE INDEX idx_flood_zone_property_id
ON flood_zone_info(property_id);

CREATE INDEX idx_permit_records_property_id
ON permit_records(property_id);