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




-- MILESTONE 3
-- 1. RISK ASSESSMENTS

CREATE TABLE risk_assessments (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    risk_score INT NOT NULL,
    overall_risk_level VARCHAR(20) NOT NULL,
    tax_risk_note TEXT,
    flood_risk_note TEXT,
    zoning_risk_note TEXT,
    permit_risk_note TEXT,
    environmental_risk_note TEXT,
    assessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_risk_assessment_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_risk_score
        CHECK (risk_score >= 0 AND risk_score <= 100),

    CONSTRAINT chk_overall_risk_level
        CHECK (overall_risk_level IN ('LOW', 'MEDIUM', 'HIGH'))
);

CREATE INDEX idx_risk_assessments_property_id
ON risk_assessments(property_id);


-- 2. COMPARABLE PROPERTY ANALYSIS

CREATE TABLE comparable_property_analysis (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    address VARCHAR(255) NOT NULL,
    price NUMERIC(15,2) NOT NULL,
    distance_km NUMERIC(10,2) NOT NULL,

    CONSTRAINT fk_comparable_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_comparable_property_property_id
ON comparable_property_analysis(property_id);


-- 3. RISK FACTORS

CREATE TABLE risk_factors (
    id BIGSERIAL PRIMARY KEY,
    risk_assessment_id BIGINT NOT NULL,
    factor_type VARCHAR(50) NOT NULL,
    factor_name VARCHAR(100) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    risk_score INT,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_risk_factor_assessment
        FOREIGN KEY (risk_assessment_id)
        REFERENCES risk_assessments(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_risk_factor_score
        CHECK (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100))
);

CREATE INDEX idx_risk_factors_assessment_id
ON risk_factors(risk_assessment_id);


-- 4. PROPERTY VALUATIONS

CREATE TABLE property_valuations (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    valuation_method VARCHAR(50) NOT NULL,
    estimated_value NUMERIC(15,2) NOT NULL,
    min_value NUMERIC(15,2),
    max_value NUMERIC(15,2),
    confidence_score NUMERIC(5,2),
    valuation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valuation_status VARCHAR(30) DEFAULT 'COMPLETED',
    notes TEXT,

    CONSTRAINT fk_property_valuation_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_valuation_value
        CHECK (estimated_value >= 0),

    CONSTRAINT chk_confidence_score
        CHECK (
            confidence_score IS NULL
            OR (confidence_score >= 0 AND confidence_score <= 100)
        )
);

CREATE INDEX idx_property_valuations_property_id
ON property_valuations(property_id);


-- 5. DUE DILIGENCE REPORTS

CREATE TABLE due_diligence_reports (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL,
    risk_assessment_id BIGINT,
    report_title VARCHAR(255) NOT NULL,
    report_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    overall_risk_level VARCHAR(20),
    summary TEXT,
    generated_by BIGINT,
    generated_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_property
        FOREIGN KEY (property_id)
        REFERENCES properties(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_report_risk_assessment
        FOREIGN KEY (risk_assessment_id)
        REFERENCES risk_assessments(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_report_generated_by
        FOREIGN KEY (generated_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_due_diligence_reports_property_id
ON due_diligence_reports(property_id);

CREATE INDEX idx_due_diligence_reports_risk_assessment_id
ON due_diligence_reports(risk_assessment_id);


-- 6. REPORT EXPORTS

CREATE TABLE report_exports (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL,
    export_format VARCHAR(20) NOT NULL,
    file_name VARCHAR(255),
    file_path TEXT,
    export_status VARCHAR(30) NOT NULL DEFAULT 'GENERATED',
    exported_by BIGINT,
    exported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_export_report
        FOREIGN KEY (report_id)
        REFERENCES due_diligence_reports(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_report_export_user
        FOREIGN KEY (exported_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_report_exports_report_id
ON report_exports(report_id);



-- 7. NOTIFICATIONS

CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    notification_type VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_id
ON notifications(user_id);


-- 8. AUDIT LOGS

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_log_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_user_id
ON audit_logs(user_id);

CREATE INDEX idx_audit_logs_entity
ON audit_logs(entity_type, entity_id);