package com.realestate.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class Notification {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(name = "property_id")
private Long propertyId;

@Column(nullable = false, length = 255)
private String message;

@Column(length = 50)
private String type;

@Column(length = 30)
private String status = "UNREAD";

@Column(name = "created_at")
private LocalDateTime createdAt = LocalDateTime.now();

}