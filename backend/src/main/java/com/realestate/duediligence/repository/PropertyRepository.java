package com.realestate.duediligence.repository;

import java.util.List; // Used when a query can return multiple Property objects.

import org.springframework.data.jpa.repository.JpaRepository; // Provides ready-made database operations.

import com.realestate.duediligence.entity.Property; // Entity managed by this repository.

/**
 * Repository interface responsible for database operations related to Property.
 *
 * By extending JpaRepository<Property, Long>, Spring Data JPA automatically
 * provides common CRUD operations for the Property entity.
 *
 * Property -> Entity type managed by this repository. Long -> Data type of the
 * Property primary key (id).
 *
 * Additional methods can be declared here when the application needs a custom
 * search/query.
 */
public interface PropertyRepository extends JpaRepository<Property, Long> {

	/*
	 * Searches for properties whose address contains the given search text, without
	 * considering uppercase/lowercase differences.
	 *
	 * Example:
	 *
	 * findByAddressContainingIgnoreCase("main")
	 *
	 * This can match addresses such as: "Main Road" "123 MAIN Street" "main avenue"
	 *
	 * "Containing" means the search text can appear anywhere inside the address.
	 *
	 * "IgnoreCase" means uppercase and lowercase differences are ignored during the
	 * search.
	 *
	 * Spring Data JPA derives the query automatically from the method name, so we
	 * don't need to write SQL manually.
	 */
	List<Property> findByAddressContainingIgnoreCase(String address);

}
