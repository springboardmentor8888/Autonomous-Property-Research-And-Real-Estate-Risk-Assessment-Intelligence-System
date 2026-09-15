package com.realestate.duediligence.service;

import com.realestate.duediligence.entity.*;
import com.realestate.duediligence.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final TaxRecordRepository taxRecordRepository;
    private final PermitRecordRepository permitRecordRepository;
    private final ComparablePropertyRepository comparablePropertyRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository, UserRepository userRepository,
                      PropertyRepository propertyRepository, RiskAssessmentRepository riskAssessmentRepository,
                      TaxRecordRepository taxRecordRepository, PermitRecordRepository permitRecordRepository,
                      ComparablePropertyRepository comparablePropertyRepository,
                      NotificationRepository notificationRepository, AuditLogRepository auditLogRepository,
                      PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.riskAssessmentRepository = riskAssessmentRepository;
        this.taxRecordRepository = taxRecordRepository;
        this.permitRecordRepository = permitRecordRepository;
        this.comparablePropertyRepository = comparablePropertyRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Roles
        Role buyerRole = roleRepository.findByRoleName("BUYER")
                .orElseGet(() -> roleRepository.save(Role.builder().roleName("BUYER").build()));
        Role agentRole = roleRepository.findByRoleName("REAL_ESTATE_AGENT")
                .orElseGet(() -> roleRepository.save(Role.builder().roleName("REAL_ESTATE_AGENT").build()));
        Role legalRole = roleRepository.findByRoleName("LEGAL_REVIEWER")
                .orElseGet(() -> roleRepository.save(Role.builder().roleName("LEGAL_REVIEWER").build()));
        Role finRole = roleRepository.findByRoleName("FINANCIAL_INSTITUTION")
                .orElseGet(() -> roleRepository.save(Role.builder().roleName("FINANCIAL_INSTITUTION").build()));
        Role adminRole = roleRepository.findByRoleName("ADMINISTRATOR")
                .orElseGet(() -> roleRepository.save(Role.builder().roleName("ADMINISTRATOR").build()));

        // 2. Demo Users
        if (!userRepository.existsByEmail("demo@local.test")) {
            userRepository.save(User.builder()
                    .fullName("Local Demo User")
                    .email("demo@local.test")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(buyerRole)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        if (!userRepository.existsByEmail("admin@local.test")) {
            userRepository.save(User.builder()
                    .fullName("System Administrator")
                    .email("admin@local.test")
                    .passwordHash(passwordEncoder.encode("password123"))
                    .role(adminRole)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        // 3. Sample Properties
        if (propertyRepository.count() == 0) {
            Property p1 = propertyRepository.save(Property.builder()
                    .address("742 Evergreen Terrace")
                    .city("Springfield")
                    .state("IL")
                    .zipCode("62704")
                    .propertyType("Single Family Residence")
                    .parcelId("PARCEL-2026-88902")
                    .ownerName("Homer & Marge Simpson")
                    .acquiredDate(LocalDate.of(2015, 6, 14))
                    .zoneType("Residential R-2")
                    .zoneCompliant(true)
                    .floodZone("Zone X")
                    .floodRiskLevel("LOW")
                    .createdAt(LocalDateTime.now())
                    .build());

            Property p2 = propertyRepository.save(Property.builder()
                    .address("100 Ocean Drive")
                    .city("Miami")
                    .state("FL")
                    .zipCode("33139")
                    .propertyType("Luxury Condominium")
                    .parcelId("PARCEL-2026-90411")
                    .ownerName("Ocean Drive Holdings LLC")
                    .acquiredDate(LocalDate.of(2021, 3, 20))
                    .zoneType("Commercial C-1")
                    .zoneCompliant(true)
                    .floodZone("AE Flood Plain")
                    .floodRiskLevel("HIGH")
                    .createdAt(LocalDateTime.now())
                    .build());

            // 4. Risk Assessments
            riskAssessmentRepository.save(RiskAssessment.builder()
                    .propertyId(p1.getId())
                    .riskScore(12)
                    .riskLevel("LOW")
                    .taxRisk("LOW - Municipal tax assessment fully paid")
                    .floodRisk("LOW - FEMA Zone X Minimal Risk Area")
                    .zoningRisk("LOW - 100% Compliant with Municipal Zoning R-2")
                    .permitRisk("LOW - All historical building permits cleared")
                    .build());

            riskAssessmentRepository.save(RiskAssessment.builder()
                    .propertyId(p2.getId())
                    .riskScore(68)
                    .riskLevel("HIGH")
                    .taxRisk("MEDIUM - Delinquent tax surcharge under appeal")
                    .floodRisk("HIGH - Coastal AE Special Flood Hazard Zone")
                    .zoningRisk("LOW - Commercial Mixed-Use Approved")
                    .permitRisk("MEDIUM - Open structural alteration permit pending inspection")
                    .build());

            // 5. Tax Records
            taxRecordRepository.save(TaxRecord.builder().propertyId(p1.getId()).year(2025).amountPaid(4200.0).status("PAID").build());
            taxRecordRepository.save(TaxRecord.builder().propertyId(p1.getId()).year(2024).amountPaid(4100.0).status("PAID").build());
            taxRecordRepository.save(TaxRecord.builder().propertyId(p2.getId()).year(2025).amountPaid(18500.0).status("PENDING_APPEAL").build());

            // 6. Permit Records
            permitRecordRepository.save(PermitRecord.builder().propertyId(p1.getId()).permitType("Roof Renovation").status("APPROVED_CLOSED").issuedDate(LocalDate.of(2022, 9, 10)).build());
            permitRecordRepository.save(PermitRecord.builder().propertyId(p2.getId()).permitType("Balcony Enclosure").status("PENDING_INSPECTION").issuedDate(LocalDate.of(2025, 11, 4)).build());

            // 7. Comparables
            comparablePropertyRepository.save(ComparableProperty.builder().propertyId(p1.getId()).address("740 Evergreen Terrace, Springfield, IL").price(340000.0).distanceKm(0.05).build());
            comparablePropertyRepository.save(ComparableProperty.builder().propertyId(p1.getId()).address("812 Maple Street, Springfield, IL").price(355000.0).distanceKm(0.4).build());

            // 8. Notifications
            notificationRepository.save(Notification.builder().userId(1L).type("SYSTEM").message("Welcome to Infosys Autonomous Property Risk Assessment Console.").read(false).createdAt(LocalDateTime.now()).build());
            notificationRepository.save(Notification.builder().userId(1L).type("RISK_ALERT").message("Property 742 Evergreen Terrace cleared title verification with LOW risk rating.").read(false).createdAt(LocalDateTime.now()).build());

            // 9. Initial Audit Log
            auditLogRepository.save(AuditLog.builder().userId(1L).action("SYSTEM_INITIALIZED: Seeded initial property risk database").timestamp(LocalDateTime.now()).build());
        }
    }
}
