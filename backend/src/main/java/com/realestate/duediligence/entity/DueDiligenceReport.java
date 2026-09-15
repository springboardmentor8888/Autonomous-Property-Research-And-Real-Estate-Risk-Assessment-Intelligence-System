package com.realestate.duediligence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DueDiligenceReport {

    @Id
    @Column(name = "id", nullable = false, length = 100)
    private String id; // Report ID e.g. UUID

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @Column(name = "pdf_path")
    private String pdfPath;

    @Column(name = "excel_path")
    private String excelPath;

    @PrePersist
    protected void onCreate() {
        if (generatedAt == null) {
            generatedAt = LocalDateTime.now();
        }
    }
}
