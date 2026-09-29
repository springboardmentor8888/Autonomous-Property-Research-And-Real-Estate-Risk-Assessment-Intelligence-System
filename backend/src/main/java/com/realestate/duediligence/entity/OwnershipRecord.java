package com.realestate.duediligence.entity;

import java.time.LocalDate;
import jakarta.persistence.*;
import lombok.Data;

/**
 * Entity class representing one owner's period of ownership for a property. A
 * property can have multiple ownership records over time (previous owners) —
 * transferDate is null for the current owner.
 */
@Entity
@Table(name = "ownership_records")
@Data
public class OwnershipRecord {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne
	@JoinColumn(name = "property_id", nullable = false)
	private Property property;

	@Column(nullable = false)
	private String ownerName;

	@Column(nullable = false)
	private LocalDate acquiredDate;

	// Date this owner transferred/sold the property to the next owner.
	// Null means this owner is the current owner.
	@Column(nullable = true)
	private LocalDate transferDate;
}