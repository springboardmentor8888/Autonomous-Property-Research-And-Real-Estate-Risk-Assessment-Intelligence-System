-- Seed default roles for H2 in-memory dev database. Production seeds
-- should live in a Flyway migration; data.sql is fine for the local
-- H2 profile because the schema is generated via ddl-auto=update.
INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'USER', 'Standard registered user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'USER');

INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'ADMIN', 'Administrative user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMIN');

INSERT INTO roles (name, description, created_at, updated_at)
SELECT 'AGENT', 'Real estate agent', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'AGENT');
