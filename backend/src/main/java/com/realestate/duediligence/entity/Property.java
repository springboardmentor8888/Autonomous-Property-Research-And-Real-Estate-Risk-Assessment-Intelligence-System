package com.realestate.duediligence.entity;

import jakarta.persistence.*; // JPA annotations used to map this Java class to a database table.
import lombok.Data; // Lombok generates getters, setters, toString, equals and hashCode.

/**
 * Entity class representing a property in the application.
 *
 * This class is mapped to the "properties" table in the database. Each object
 * of this class represents one property record.
 *
 * Example: A Property object containing an address, city, state, and property
 * type can be stored as one row in the properties table.
 */

@Entity
@Table(name = "properties")
@Data
public class Property {

	/*
	 * Primary key of the properties table.
	 *
	 * @Id marks this field as the primary key.
	 *
	 * @GeneratedValue tells JPA to automatically generate the ID when a new
	 * property is saved.
	 *
	 * GenerationType.IDENTITY generally means the database generates the ID, such
	 * as through AUTO_INCREMENT.
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/*
	 * Full address of the property.
	 *
	 * nullable = false means this value cannot be NULL in the database.
	 */
	@Column(nullable = false)
	private String address;

	/*
	 * City where the property is located.
	 *
	 * nullable = false means a city must be provided.
	 */
	@Column(nullable = false)
	private String city;

	/*
	 * State where the property is located.
	 *
	 * nullable = false means a state must be provided.
	 */
	@Column(nullable = false)
	private String state;

	/*
	 * ZIP/PIN code of the property's location.
	 *
	 * It is stored as a String because ZIP/PIN codes are identifiers, not values
	 * that we normally perform mathematical calculations on.
	 */
	@Column(nullable = false)
	private String zipCode;

	/*
	 * Type/category of the property.
	 *
	 * PropertyType is an enum that contains the allowed property types in the
	 * application.
	 *
	 * @Enumerated(EnumType.STRING) tells JPA to store the enum value as text in the
	 * database.
	 *
	 * For example: propertyType = RESIDENTIAL
	 *
	 * Database value: "RESIDENTIAL"
	 *
	 * Storing the enum as String is preferred over storing its numeric position
	 * because it is safer if the order of enum values changes later.
	 */
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private PropertyType propertyType;

}
