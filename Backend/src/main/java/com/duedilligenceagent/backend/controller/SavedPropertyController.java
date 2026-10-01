package com.duedilligenceagent.backend.controller;

import com.duedilligenceagent.backend.entities.SavedProperty;
import com.duedilligenceagent.backend.entities.User;
import com.duedilligenceagent.backend.repositories.UserRepository;
import com.duedilligenceagent.backend.service.SavedPropertyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Saved-property endpoints (SRS): list the authenticated user's saved
 * properties, save one by property id and remove one. All require a
 * valid access token. Entities are never serialized — lazy relations
 * would be unsafe without jackson-datatype-hibernate, so responses use
 * DTO records (SupportingDocsController pattern).
 */
@RestController
@RequestMapping("/api/saved-properties")
public class SavedPropertyController {

    private final SavedPropertyService savedPropertyService;
    private final UserRepository userRepository;

    public SavedPropertyController(SavedPropertyService savedPropertyService,
                                   UserRepository userRepository) {
        this.savedPropertyService = savedPropertyService;
        this.userRepository = userRepository;
    }

    /** The current user's saved properties, newest first. */
    @GetMapping
    public ResponseEntity<List<SavedPropertyResponse>> list(
            @AuthenticationPrincipal UserDetails userDetails) {

        List<SavedPropertyResponse> saved = savedPropertyService
                .listForUser(userIdOf(userDetails)).stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(saved);
    }

    /** Saves a property for the current user (idempotent). */
    @PostMapping
    public ResponseEntity<?> save(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SavedPropertyRequest body) {

        if (body == null || body.propertyId() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "propertyId is required"));
        }

        SavedProperty saved = savedPropertyService.save(
                userIdOf(userDetails), body.propertyId());
        return ResponseEntity.ok(toResponse(saved));
    }

    /** Removes one saved property for the current user (silent no-op). */
    @DeleteMapping("/{propertyId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long propertyId) {

        savedPropertyService.delete(userIdOf(userDetails), propertyId);
        return ResponseEntity.noContent().build();
    }

    private SavedPropertyResponse toResponse(SavedProperty saved) {
        return new SavedPropertyResponse(
                saved.getSavedPropertyId(),
                saved.getPropertyId(),
                saved.getCreatedAt().toString()
        );
    }

    /** Resolves the authenticated user's id from the JWT principal. */
    private Long userIdOf(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found: " + userDetails.getUsername()));
        return user.getUserId();
    }

    public record SavedPropertyRequest(Long propertyId) {}

    public record SavedPropertyResponse(
            Long savedPropertyId,
            Long propertyId,
            String createdAt
    ) {}
}
