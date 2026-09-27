package com.realestate.backend.entity;

import com.realestate.backend.entity.Property;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "comparable_properties")
public class ComparableProperty {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "property_id", nullable = false)
private Property property;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "comparable_property_id", nullable = false)
private Property comparableProperty;

@Column(name = "price_difference", precision = 15, scale = 2)
private BigDecimal priceDifference;

@Column(name = "similarity_score", precision = 5, scale = 2)
private BigDecimal similarityScore;

@Column(length = 500)
private String reason;

}