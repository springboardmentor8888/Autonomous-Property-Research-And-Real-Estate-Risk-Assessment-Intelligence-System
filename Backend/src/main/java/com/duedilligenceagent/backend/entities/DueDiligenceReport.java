package com.duedilligenceagent.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "due_diligence_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DueDiligenceReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "generated_by", nullable = false)
    private Long generatedBy;

    @Column(name = "risk_assessment_id")
    private Long riskAssessmentId;

    @Column(name = "executive_summary", length = 2000)
    private String executiveSummary;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by", insertable = false, updatable = false)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "risk_assessment_id", insertable = false, updatable = false)
    private RiskAssessmentDetails riskAssessmentDetails;

    @PrePersist
    protected void onCreate() {
        this.generatedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}