package com.duedilligenceagent.backend.service;

import com.duedilligenceagent.backend.entities.SavedProperty;
import com.duedilligenceagent.backend.exception.ResourceNotFoundException;
import com.duedilligenceagent.backend.repositories.PropertyRepository;
import com.duedilligenceagent.backend.repositories.SavedPropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Saved-property use cases (SRS): save a property to the user's list,
 * list the saved properties, remove one and check saved state. Saves
 * are idempotent — saving an already-saved (user, property) pair returns
 * the existing row instead of failing on the unique constraint.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SavedPropertyService {

    private final SavedPropertyRepository savedPropertyRepository;
    private final PropertyRepository propertyRepository;

    /** Saves a property for the user (idempotent per (user, property) pair). */
    @Transactional
    public SavedProperty save(Long userId, Long propertyId) {
        propertyRepository.findById(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Property not found with id: " + propertyId));

        return savedPropertyRepository.findByUserIdAndPropertyId(userId, propertyId)
                .orElseGet(() -> savedPropertyRepository.save(SavedProperty.builder()
                        .userId(userId)
                        .propertyId(propertyId)
                        .build()));
    }

    /** The user's saved properties, newest first. */
    @Transactional(readOnly = true)
    public List<SavedProperty> listForUser(Long userId) {
        return savedPropertyRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /** Removes one saved property (silent no-op if absent). */
    @Transactional
    public void delete(Long userId, Long propertyId) {
        savedPropertyRepository.findByUserIdAndPropertyId(userId, propertyId)
                .ifPresent(savedPropertyRepository::delete);
    }

    /** Whether the user has saved the given property. */
    @Transactional(readOnly = true)
    public boolean isSaved(Long userId, Long propertyId) {
        return savedPropertyRepository.existsByUserIdAndPropertyId(userId, propertyId);
    }
}
