package com.realestate.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "properties", indexes = {
@Index(name = "idx_property_city", columnList = "city"),
@Index(name = "idx_property_state", columnList = "state"),
@Index(name = "idx_property_zip", columnList = "zip_code"),
@Index(name = "idx_property_type", columnList = "property_type"),
@Index(name = "idx_property_status", columnList = "status")
})
public class Property {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(nullable = false)
private String title;

@Column(nullable = false, length = 500)
private String address;

@Column(nullable = false, length = 100)
private String city;

@Column(nullable = false, length = 100)
private String state;

@Column(name = "zip_code", nullable = false, length = 20)
private String zipCode;

@Column(length = 100)
private String country;

@Column(nullable = false, precision = 15, scale = 2)
private BigDecimal price;

private Integer bedrooms;

private Integer bathrooms;

@Column(name = "square_feet")
private Double squareFeet;

@Column(name = "property_type", length = 50)
private String propertyType;

@Column(name = "year_built")
private Integer yearBuilt;

@Column(columnDefinition = "TEXT")
private String description;

@Column(length = 30)
private String status = "AVAILABLE";

@OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
private List<PropertyHistory> historyRecords = new ArrayList<>();

@OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
private List<Ownership> ownershipRecords = new ArrayList<>();

@CreationTimestamp
@Column(name = "created_at", updatable = false)
private LocalDateTime createdAt;

@UpdateTimestamp
@Column(name = "updated_at")
private LocalDateTime updatedAt;

}