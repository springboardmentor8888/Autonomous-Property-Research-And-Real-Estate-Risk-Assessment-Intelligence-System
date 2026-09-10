package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * JPA repository for {@link User}. Standard CRUD is inherited from
 * {@link JpaRepository}; only the queries actually used by the service
 * layer are declared here.
 * <p>
 * Spring Data wires the implementation at startup — no manual code needed.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /** Look up by email (used during registration to enforce uniqueness). */
    Optional<User> findByEmail(String email);

    /** Look up by email with role eagerly loaded. */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role WHERE u.email = :email")
    Optional<User> findByEmailWithRole(String email);

    /** Used by registration to short-circuit before a DB constraint violation. */
    boolean existsByEmail(String email);

    /** Fetch all users with roles eagerly loaded to avoid LazyInitializationException. */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.role")
    List<User> findAllWithRoles();
}
