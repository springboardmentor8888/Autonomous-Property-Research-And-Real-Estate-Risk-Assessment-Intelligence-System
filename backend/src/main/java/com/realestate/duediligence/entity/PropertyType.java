package com.realestate.duediligence.entity;

/**
 * Defines the different types of properties supported by the application.
 *
 * Using an enum ensures that a property can have only one of these predefined
 * property types.
 */
public enum PropertyType {

	// Property used for residential purposes, such as a house or apartment.
	RESIDENTIAL,

	// Property used for business or commercial purposes.
	COMMERCIAL,

	// Property used for industrial purposes, such as factories or warehouses.
	INDUSTRIAL,

	// Land or a plot without a specific building/property type.
	LAND
}
