package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaxHistoryDTO {
    private Integer year;
    private BigDecimal amountPaid;
    private BigDecimal amountAssessed;
    private String status;           // PAID, DELINQUENT, PENDING, PARTIAL
    private String paymentDate;
    private String notes;
}
