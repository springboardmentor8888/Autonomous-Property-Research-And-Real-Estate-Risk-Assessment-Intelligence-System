package com.realestate.duediligence.entity;

/**
 * Represents the possible tax payment states for a property's
 * tax history record.
 *
 * WHY an enum instead of a String: prevents invalid or inconsistent
 * status values from being stored (e.g. "paid" vs "Paid" vs "PAID").
 */
public enum TaxStatus {
    PAID,
    OVERDUE,
    PARTIALLY_PAID
}