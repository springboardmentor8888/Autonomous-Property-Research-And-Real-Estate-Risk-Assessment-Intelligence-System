package com.realestate.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.EnvironmentalRecord;
import com.realestate.backend.Exception.EnvironmentalRecordNotFoundException;
import com.realestate.backend.Repository.EnvironmentalRecordRepository;

@Service
public class EnvironmentalRecordService {

    private final EnvironmentalRecordRepository environmentalRecordRepository;

    public EnvironmentalRecordService(
            EnvironmentalRecordRepository environmentalRecordRepository) {
        this.environmentalRecordRepository = environmentalRecordRepository;
    }

    public EnvironmentalRecord createEnvironmentalRecord(
            EnvironmentalRecord environmentalRecord) {

        return environmentalRecordRepository.save(environmentalRecord);
    }

    public List<EnvironmentalRecord> getAllEnvironmentalRecords() {

        return environmentalRecordRepository.findAll();
    }

    public EnvironmentalRecord getEnvironmentalRecordById(Long id) {

        return environmentalRecordRepository.findById(id)
                .orElseThrow(() ->
                        new EnvironmentalRecordNotFoundException(
                                "Environmental Record not found"));
    }

    public List<EnvironmentalRecord> getEnvironmentalRecordsByPropertyId(
            Long propertyId) {

        return environmentalRecordRepository
                .findByPropertyId(propertyId);
    }
}