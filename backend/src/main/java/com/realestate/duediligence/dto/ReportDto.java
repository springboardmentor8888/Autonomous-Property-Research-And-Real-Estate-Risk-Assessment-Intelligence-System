package com.realestate.duediligence.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDto {
    private String reportId;
    private Long propertyId;
    private LocalDateTime generatedAt;
    private String downloadUrlPdf;
    private String downloadUrlExcel;
}
