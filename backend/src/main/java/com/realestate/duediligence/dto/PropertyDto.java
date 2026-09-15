package com.realestate.duediligence.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyDto {
    private Long id;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String propertyType;
    private String parcelId;

    private OwnershipInfo ownership;
    private List<TaxHistoryItem> taxHistory;
    private ZoningInfo zoning;
    private FloodZoneInfo floodZone;
    private List<PermitItem> permits;

    @Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
    public static class OwnershipInfo {
        private String ownerName;
        private LocalDate acquiredDate;
    }

    @Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
    public static class TaxHistoryItem {
        private Integer year;
        private Double amountPaid;
        private String status;
    }

    @Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
    public static class ZoningInfo {
        private String zoneType;
        private Boolean compliant;
    }

    @Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
    public static class FloodZoneInfo {
        private String zone;
        private String riskLevel;
    }

    @Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
    public static class PermitItem {
        private String permitType;
        private String status;
        private LocalDate issuedDate;
    }
}
