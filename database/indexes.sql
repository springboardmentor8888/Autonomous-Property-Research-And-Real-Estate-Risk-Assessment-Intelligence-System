-- Foreign-key columns are not indexed automatically in PostgreSQL.
-- Every findByPropertyId(...) query filters on these columns.
CREATE INDEX IF NOT EXISTS idx_ownership_property    ON ownership_records (property_id);
CREATE INDEX IF NOT EXISTS idx_tax_property          ON tax_history (property_id);
CREATE INDEX IF NOT EXISTS idx_zoning_property       ON zoning_info (property_id);
CREATE INDEX IF NOT EXISTS idx_flood_property        ON flood_zone_info (property_id);
CREATE INDEX IF NOT EXISTS idx_permit_property       ON permit_records (property_id);
CREATE INDEX IF NOT EXISTS idx_environmental_property ON environmental_records (property_id);
CREATE INDEX IF NOT EXISTS idx_utility_property      ON utility_info (property_id);

-- Audit log lookups by action and newest-first listing.
CREATE INDEX IF NOT EXISTS idx_audit_action          ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp       ON audit_logs (timestamp DESC);