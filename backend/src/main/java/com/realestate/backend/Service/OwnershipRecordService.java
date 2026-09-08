package com.realestate.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.OwnershipRecord;
import com.realestate.backend.Exception.OwnershipRecordNotFoundException;
import com.realestate.backend.Repository.OwnershipRecordRepository;

@Service
public class OwnershipRecordService {

    private final OwnershipRecordRepository ownershipRecordRepository;

    public OwnershipRecordService(
            OwnershipRecordRepository ownershipRecordRepository) {

        this.ownershipRecordRepository = ownershipRecordRepository;
    }

    public OwnershipRecord createOwnershipRecord(
            OwnershipRecord ownershipRecord) {

        return ownershipRecordRepository.save(ownershipRecord);
    }

    public List<OwnershipRecord> getAllOwnershipRecords() {

        return ownershipRecordRepository.findAll();
    }

    public OwnershipRecord getOwnershipRecordById(Long id) {

        return ownershipRecordRepository.findById(id)
                .orElseThrow(() ->
                        new OwnershipRecordNotFoundException(
                                "Ownership Record not found"));
    }
    public List<OwnershipRecord> getOwnershipRecordsByPropertyId(
            Long propertyId) {

        return ownershipRecordRepository.findByPropertyId(propertyId);
    }
}