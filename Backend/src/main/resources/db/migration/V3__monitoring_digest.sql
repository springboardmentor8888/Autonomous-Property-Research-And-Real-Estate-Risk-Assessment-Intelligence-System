-- Monitoring change detection (Module 7 — Scheduled Monitoring):
-- fingerprint (SHA-256 digest) of the property's stored diligence
-- record values from the previous scheduled check. Null until the first
-- check stores the baseline; a later mismatch means a record changed
-- and triggers a MONITORING_UPDATE notification.
-- Nullable by design: existing rows simply get their baseline on the
-- next scheduled check. V1 is never edited; the seed is unaffected.

ALTER TABLE public.property_monitoring ADD COLUMN last_digest text;
