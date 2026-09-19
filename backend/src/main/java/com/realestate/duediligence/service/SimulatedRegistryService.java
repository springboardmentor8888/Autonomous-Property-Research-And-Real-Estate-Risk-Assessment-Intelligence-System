package com.realestate.duediligence.service;

import com.realestate.duediligence.entity.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Simulates external data sources such as:
 * - Land Registry
 * - Tax Authority
 * - Zoning Office
 * - Flood Zone Authority
 * - Permit Office
 * - Environmental Agency
 * - Utility Providers
 *
 * WHY:
 * The SRS requires integration with external data sources,
 * but real government APIs are not available for this project.
 *
 * Therefore, this service generates realistic sample data
 * instead of calling real external APIs.
 *
 * IMPORTANT:
 * This class only creates and returns entity objects.
 * It does NOT save anything directly to the database.
 *
 * The generated entity is later saved by the appropriate
 * repository inside PropertyService.
 */
@Service
public class SimulatedRegistryService {


    /**
     * Simulates retrieving ownership information from
     * a Land Registry.
     *
     * @param property property for which ownership information is required
     * @return generated OwnershipRecord
     */
    public OwnershipRecord generateOwnership(Property property) {

        // Create a new ownership record object.
        OwnershipRecord record = new OwnershipRecord();

        // Associate the ownership record with the requested property.
        record.setProperty(property);

        // Simulated owner name returned by the Land Registry.
        record.setOwnerName("R. Kumar");

        // Simulated date on which the owner acquired the property.
        record.setAcquiredDate(LocalDate.of(2018, 3, 12));

        // Return the generated record to the calling service.
        return record;
    }


    /**
     * Simulates retrieving tax information from a Tax Authority.
     *
     * @param property property for which tax information is required
     * @return generated TaxHistory record
     */
    public TaxHistory generateTaxHistory(Property property) {

        // Create a new tax history record.
        TaxHistory record = new TaxHistory();

        // Associate the tax record with the requested property.
        record.setProperty(property);

        /*
         * Generate the previous year's tax record.
         *
         * LocalDate.now().getYear() gives the current year.
         * Subtracting 1 gives the previous year.
         *
         * Example:
         * Current year = 2026
         * Generated tax year = 2025
         */
        record.setYear(LocalDate.now().getYear() - 1);

        /*
         * BigDecimal is used for monetary values because
         * it provides better precision than double/float.
         */
        record.setAmountPaid(new BigDecimal("45000"));

        // Simulated tax payment status.
        record.setStatus(TaxStatus.PAID);

        // Return the generated tax record.
        return record;
    }


    /**
     * Simulates retrieving zoning information from
     * a Zoning Office.
     *
     * @param property property for which zoning information is required
     * @return generated ZoningInfo record
     */
    public ZoningInfo generateZoning(Property property) {

        // Create a new zoning information object.
        ZoningInfo record = new ZoningInfo();

        // Associate zoning information with the property.
        record.setProperty(property);

        // Simulated zoning classification.
        record.setZoneType("Residential - R1");

        // Indicates whether the property's usage complies with zoning rules.
        record.setCompliant(true);

        // Return the generated zoning information.
        return record;
    }


    /**
     * Simulates retrieving flood-zone information from
     * a Flood Zone Authority.
     *
     * @param property property for which flood information is required
     * @return generated FloodZoneInfo record
     */
    public FloodZoneInfo generateFloodZone(Property property) {

        // Create a new flood-zone information object.
        FloodZoneInfo record = new FloodZoneInfo();

        // Associate flood-zone information with the property.
        record.setProperty(property);

        // Simulated flood-zone classification.
        record.setZone("Zone X");

        // Simulated flood risk level.
        record.setRiskLevel(RiskLevel.LOW);

        // Return the generated flood-zone information.
        return record;
    }


    /**
     * Simulates retrieving building permit information
     * from a Permit Office.
     *
     * @param property property for which permit information is required
     * @return generated PermitRecord
     */
    public PermitRecord generatePermit(Property property) {

        // Create a new permit record.
        PermitRecord record = new PermitRecord();

        // Associate the permit with the requested property.
        record.setProperty(property);

        // Simulated type of permit issued for the property.
        record.setPermitType("Renovation");

        // Simulated permit status.
        record.setStatus(PermitStatus.APPROVED);

        // Simulated date on which the permit was issued.
        record.setIssuedDate(LocalDate.of(2021, 5, 1));

        // Return the generated permit information.
        return record;
    }


    // ---------- ENVIRONMENTAL AND UTILITY DATA ----------


    /**
     * Simulates retrieving environmental assessment information
     * from an Environmental Agency.
     *
     * @param property property for which environmental information is required
     * @return generated EnvironmentalRecord
     */
    public EnvironmentalRecord generateEnvironmentalRecord(Property property) {

        // Create a new environmental assessment record.
        EnvironmentalRecord record = new EnvironmentalRecord();

        // Associate the environmental record with the property.
        record.setProperty(property);

        /*
         * Indicates whether an environmental hazard was found
         * during the simulated assessment.
         */
        record.setHazardFound(false);

        // No hazard was found, so the hazard type is "None".
        record.setHazardType("None");

        // Simulated date of the environmental assessment.
        record.setAssessmentDate(LocalDate.of(2023, 8, 15));

        // Return the generated environmental information.
        return record;
    }


    /**
     * Simulates retrieving utility connection information
     * from a utility provider.
     *
     * @param property property for which utility information is required
     * @return generated UtilityInfo record
     */
    public UtilityInfo generateUtilityInfo(Property property) {

        // Create a new utility information record.
        UtilityInfo record = new UtilityInfo();

        // Associate the utility information with the property.
        record.setProperty(property);

        // Simulated water connection status.
        record.setWaterConnected(true);

        // Simulated electricity connection status.
        record.setElectricityConnected(true);

        // Simulated gas connection status.
        record.setGasConnected(true);

        // Simulated utility provider name.
        record.setProvider("City Utilities Board");

        // Return the generated utility information.
        return record;
    }
}
