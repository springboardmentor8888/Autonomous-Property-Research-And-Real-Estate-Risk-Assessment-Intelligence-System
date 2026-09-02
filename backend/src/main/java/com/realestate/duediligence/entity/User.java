package com.realestate.duediligence.entity;

import jakarta.persistence.*; // JPA annotations used to map this Java class to the database.
import lombok.Data; // Lombok annotation that generates getters, setters, toString, equals, and hashCode.

/**
 * Entity class representing a user in the application.
 *
 * This class is mapped to the "users" table in the database. Each object of
 * this class represents one user record.
 *
 * JPA/Hibernate uses this class to map Java objects to rows and columns in the
 * database.
 */

@Entity
@Table(name = "users")
@Data
public class User {

	/*
	 * Primary key of the users table.
	 *
	 * @Id marks this field as the primary key.
	 * 
	 * @GeneratedValue tells JPA to automatically generate the ID value when a new
	 * user is saved.
	 *
	 * IDENTITY means the database is responsible for generating the ID, typically
	 * using AUTO_INCREMENT.
	 */
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/*
	 * Name of the user.
	 *
	 * nullable = false means this column cannot contain NULL values in the
	 * database.
	 */
	@Column(nullable = false)
	private String fullName;

	/*
	 * Email address of the user.
	 *
	 * nullable = false: The email cannot be NULL.
	 *
	 * unique = true: Two users cannot have the same email address.
	 */
	@Column(nullable = false, unique = true)
	private String email;

	/*
	 * Password of the user.
	 *
	 * nullable = false means every user record must have a password value.
	 *
	 * Note: In a real application, passwords should never be stored as plain text.
	 * They should be securely hashed before being stored in the database.
	 */
	@Column(nullable = false)
	private String password;

	/*
	 * Role assigned to the user.
	 *
	 * @Enumerated(EnumType.STRING) tells JPA to store the enum value as text (for
	 * example, "ADMIN" or "USER") instead of storing its numeric position.
	 *
	 * This is safer because changing the order of enum values will not change the
	 * meaning of existing database records.
	 */
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Role role;
}
