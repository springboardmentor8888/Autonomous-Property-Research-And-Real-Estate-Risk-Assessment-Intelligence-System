package com.realestate.duediligence.entity;

/**
 * Defines the different roles that a user can have in the application.
 *
 * Using an enum restricts the role value to one of the predefined values below
 * instead of allowing arbitrary String values.
 *
 * Example: A User can have the role BUYER, but cannot have an invalid role such
 * as "CUSTOMER" unless it is added to this enum.
 */
public enum Role {

	// User who is purchasing or evaluating a property.
	BUYER,

	// Professional real estate agent involved in the transaction.
	REAL_ESTATE_AGENT,

	// Person responsible for reviewing legal/property documents.
	LEGAL_REVIEWER,

	// Financial institution involved in property financing or evaluation.
	FINANCIAL_INSTITUTION,

	// User with administrative privileges in the application.
	ADMINISTRATOR
}
