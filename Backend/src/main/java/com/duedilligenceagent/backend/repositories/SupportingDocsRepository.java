package com.duedilligenceagent.backend.repositories;

import com.duedilligenceagent.backend.entities.SupportingDocs;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportingDocsRepository extends JpaRepository<SupportingDocs, Long> {

    /** All documents uploaded for a property, newest first. */
    List<SupportingDocs> findByPropertyIdOrderByUploadedAtDesc(Long propertyId);

    /** All documents attached to a report, newest first. */
    List<SupportingDocs> findByReportIdOrderByUploadedAtDesc(Long reportId);
}
