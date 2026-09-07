package com.duedilligenceagent.backend.dto.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Portfolio view returned to the frontend. Wrapped in a top-level
 * {@code message} string for invalid / empty portfolio cases (matches the
 * same pattern as {@code PropertySearchApiResponse}).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPortfolioResponse {

    private boolean success;

    private String message;

    private String userId;

    private List<PortfolioItem> properties;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PortfolioItem {
        private Long propertyId;
        private String address;
        private String status;
    }
}
