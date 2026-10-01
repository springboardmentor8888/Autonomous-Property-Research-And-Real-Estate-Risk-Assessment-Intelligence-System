package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.entities.DueDiligenceReport;
import com.duedilligenceagent.backend.entities.SupportingDocs;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.DueDiligenceReportRepository;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.SupportingDocsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * Supporting-document management (SRS): files uploaded against a
 * due-diligence report are stored on local disk under the configurable
 * {@code app.uploads.dir} (overridable via env/.env); metadata lives in the
 * supporting_docs table. Server paths are never exposed to clients —
 * downloads stream through a document id.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SupportingDocsService {

    private final SupportingDocsRepository supportingDocsRepository;
    private final PropertyRepository propertyRepository;
    private final DueDiligenceReportRepository reportRepository;

    @Value("${app.uploads.dir:uploads}")
    private String uploadsDir;

    /** Stores a document on disk and persists its metadata. */
    public SupportingDocs upload(Long userId, Long propertyId, Long reportId,
                                 MultipartFile file) {
        propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Property not found with id: " + propertyId));

        Long effectiveReportId = reportId != null ? reportId
                : reportRepository
                        .findFirstByPropertyIdOrderByGeneratedAtDesc(propertyId)
                        .map(DueDiligenceReport::getReportId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "No report exists for this property yet — "
                                        + "generate a report before uploading documents"));

        String original = file.getOriginalFilename() != null
                ? file.getOriginalFilename() : "document";
        String fileName = new File(original).getName();

        String fileType = file.getContentType();
        if (fileType != null && fileType.length() > 50) {
            fileType = fileType.substring(0, 50);
        }

        try {
            Path dir = Paths.get(uploadsDir, String.valueOf(propertyId));
            Files.createDirectories(dir);
            Path target = dir.resolve(UUID.randomUUID() + "_" + fileName);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            SupportingDocs doc = SupportingDocs.builder()
                    .reportId(effectiveReportId)
                    .propertyId(propertyId)
                    .uploadedBy(userId)
                    .fileName(fileName)
                    .fileType(fileType)
                    .filePath(target.toString())
                    .build();
            return supportingDocsRepository.save(doc);
        } catch (IOException ex) {
            log.warn("Failed to store document for property {}: {}",
                    propertyId, ex.getMessage());
            throw new IllegalStateException("Failed to store document");
        }
    }

    /** A property's documents, newest first. */
    public List<SupportingDocs> listForProperty(Long propertyId) {
        return supportingDocsRepository
                .findByPropertyIdOrderByUploadedAtDesc(propertyId);
    }

    /** Resolves a document's metadata for download (owner not required). */
    public SupportingDocs get(Long documentId) {
        return supportingDocsRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Document not found with id: " + documentId));
    }

    /** The on-disk resource for a stored document. */
    public Resource fileResource(SupportingDocs doc) {
        Path path = Paths.get(doc.getFilePath());
        if (!Files.exists(path)) {
            throw new ResourceNotFoundException(
                    "Document file missing on disk: " + doc.getFileName());
        }
        try {
            return new UrlResource(path.toUri());
        } catch (MalformedURLException ex) {
            throw new IllegalStateException("Invalid stored document path");
        }
    }

    /** Deletes a document (uploader only); the file is removed from disk too. */
    public void delete(Long documentId, Long userId) {
        SupportingDocs doc = get(documentId);
        if (!doc.getUploadedBy().equals(userId)) {
            throw new ResourceNotFoundException(
                    "Document not found with id: " + documentId);
        }
        try {
            Files.deleteIfExists(Paths.get(doc.getFilePath()));
        } catch (IOException ex) {
            log.warn("Failed to delete document file {}: {}",
                    doc.getFilePath(), ex.getMessage());
        }
        supportingDocsRepository.delete(doc);
    }
}
