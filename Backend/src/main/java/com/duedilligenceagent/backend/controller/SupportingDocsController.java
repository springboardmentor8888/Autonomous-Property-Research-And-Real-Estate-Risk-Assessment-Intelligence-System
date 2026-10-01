package com.duedilligenceagent.backend.controller;

import com.duedilligenceagent.backend.entities.SupportingDocs;
import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.repositories.UserRepository;
import com.duedilligenceagent.backend.service.SupportingDocsService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Supporting-document endpoints (SRS): upload against a property's
 * due-diligence report, list per property, download and delete by id.
 */
@RestController
public class SupportingDocsController {

    private final SupportingDocsService supportingDocsService;
    private final UserRepository userRepository;

    public SupportingDocsController(SupportingDocsService supportingDocsService,
                                    UserRepository userRepository) {
        this.supportingDocsService = supportingDocsService;
        this.userRepository = userRepository;
    }

    /** A property's documents, newest first. */
    @GetMapping("/api/properties/{propertyId}/documents")
    public ResponseEntity<List<SupportingDocResponse>> list(
            @PathVariable Long propertyId) {

        List<SupportingDocResponse> docs = supportingDocsService
                .listForProperty(propertyId).stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(docs);
    }

    /** Uploads a document against a property (latest report by default). */
    @PostMapping("/api/properties/{propertyId}/documents")
    public ResponseEntity<?> upload(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long propertyId,
            @RequestParam(value = "reportId", required = false) Long reportId,
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "A document file is required"));
        }

        SupportingDocs doc = supportingDocsService.upload(
                userIdOf(userDetails), propertyId, reportId, file);
        return ResponseEntity.ok(toResponse(doc));
    }

    /** Streams a stored document by id (server paths are never exposed). */
    @GetMapping("/api/documents/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        SupportingDocs doc = supportingDocsService.get(id);
        Resource resource = supportingDocsService.fileResource(doc);

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(doc.getFileType());
        } catch (Exception ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }

    /** Deletes a document (uploader only). */
    @DeleteMapping("/api/documents/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {

        supportingDocsService.delete(id, userIdOf(userDetails));
        return ResponseEntity.noContent().build();
    }

    private SupportingDocResponse toResponse(SupportingDocs doc) {
        return new SupportingDocResponse(
                doc.getDocumentId(),
                doc.getReportId(),
                doc.getPropertyId(),
                doc.getUploadedBy(),
                doc.getFileName(),
                doc.getFileType(),
                doc.getUploadedAt().toString()
        );
    }

    /** Resolves the authenticated user's id from the JWT principal. */
    private Long userIdOf(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found: " + userDetails.getUsername()));
        return user.getUserId();
    }

    public record SupportingDocResponse(
            Long documentId,
            Long reportId,
            Long propertyId,
            Long uploadedBy,
            String fileName,
            String fileType,
            String uploadedAt
    ) {}
}
