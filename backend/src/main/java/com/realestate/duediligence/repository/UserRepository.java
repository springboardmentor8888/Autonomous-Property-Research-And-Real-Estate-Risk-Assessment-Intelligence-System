package com.realestate.duediligence.repository;

import java.util.Optional; // Used to represent a value that may or may not be present.

import org.springframework.data.jpa.repository.JpaRepository; // Provides ready-made database operations.

import com.realestate.duediligence.entity.User; // User entity that this repository works with.

/**
 * Repository interface responsible for database operations related to User.
 *
 * By extending JpaRepository<User, Long>, Spring Data JPA provides commonly
 * used database operations automatically, such as:
 *
 * - save() - findById() - findAll() - deleteById() - existsById()
 *
 * User -> Entity type this repository manages. Long -> Data type of the User
 * entity's primary key (id).
 *
 * We only need to declare additional methods when we need a query that is not
 * already provided by JpaRepository.
 */
public interface UserRepository extends JpaRepository<User, Long> {

	/*
	 * Finds a user using their email address.
	 *
	 * Spring Data JPA understands the method name "findByEmail" and automatically
	 * creates the appropriate database query.
	 *
	 * Example: findByEmail("bhaskar@gmail.com")
	 *
	 * If a matching user exists: Optional contains the User.
	 *
	 * If no matching user exists: Optional is empty.
	 *
	 * Using Optional helps us handle the possibility that a user with the given
	 * email may not exist.
	 */
	Optional<User> findByEmail(String email);
}
