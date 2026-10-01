package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * A property saved by a user (SRS): one row per (user, property) pair,
 * enforced by the named unique constraint both in this entity (H2 test
 * schema via ddl-auto=create-drop) and in V2__saved_properties.sql
 * (Flyway-owned PostgreSQL schema).
 */
@Entity
@Table(name = "saved_properties", uniqueConstraints = @UniqueConstraint(
        name = "uk_saved_properties_user_property",
        columnNames = {"user_id", "property_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedProperty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "saved_property_id")
    private Long savedPropertyId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Property property;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
