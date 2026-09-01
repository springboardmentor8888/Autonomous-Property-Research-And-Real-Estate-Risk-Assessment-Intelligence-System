package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tax_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaxDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tax_id")
    private Long taxId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "tax_pay_date")
    private LocalDate taxPayDate;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    private BigDecimal taxAmount;

    @Column(name = "tax_due", precision = 15, scale = 2)
    private BigDecimal taxDue;

    @Column(name = "payment_status", length = 30)
    private String paymentStatus;

    @Column(name = "source", length = 100)
    private String source;

    @Column(name = "external_record_id", length = 100)
    private String externalRecordId;

    @Column(name = "retrieved_at", nullable = false)
    private LocalDateTime retrievedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Property property;
}