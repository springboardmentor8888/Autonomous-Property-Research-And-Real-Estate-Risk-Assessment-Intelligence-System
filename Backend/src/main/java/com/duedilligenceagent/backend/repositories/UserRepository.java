package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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

    /** Used by registration to short-circuit before a DB constraint violation. */
    boolean existsByEmail(String email);
}
