-- Seed default roles for H2 in-memory dev database. Production seeds
-- should live in a Flyway migration; data.sql is fine for the local
-- H2 profile because the schema is generated via ddl-auto=update.
INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'BUYER', 'Property buyer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'BUYER');

INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'REAL_ESTATE_AGENT', 'Real estate agent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'REAL_ESTATE_AGENT');

INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'LEGAL_REVIEWER', 'Legal document reviewer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'LEGAL_REVIEWER');

INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'FINANCIAL_INSTITUTION', 'Financial institution representative', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'FINANCIAL_INSTITUTION');

INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'ADMINISTRATOR', 'System administrator', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMINISTRATOR');

-- Pre-persist administrator account directly in database
-- Password for admin: Admin@123 (BCrypt encoded with strength 10)
INSERT INTO users (email, password_hash, is_active, role_id, created_at, updated_at)
SELECT 'admin@example.com', '$2a$10$eaaUR9ZwAbVsnkdboHVSLO4.Z2n1G9tVECBK.g7lni7XlY6VgO4Ji', true,
       (SELECT id FROM roles WHERE name = 'ADMINISTRATOR'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com');
