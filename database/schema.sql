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