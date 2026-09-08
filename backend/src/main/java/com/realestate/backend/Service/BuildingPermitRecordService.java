
package com.realestate.backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.realestate.backend.Entity.BuildingPermitRecord;
import com.realestate.backend.Exception.BuildingPermitRecordNotFoundException;
import com.realestate.backend.Repository.BuildingPermitRecordRepository;

@Service
public class BuildingPermitRecordService {

    private final BuildingPermitRecordRepository buildingPermitRecordRepository;

    public BuildingPermitRecordService(
            BuildingPermitRecordRepository buildingPermitRecordRepository) {
        this.buildingPermitRecordRepository = buildingPermitRecordRepository;
    }

    public BuildingPermitRecord createPermitRecord(
            BuildingPermitRecord permitRecord) {
        return buildingPermitRecordRepository.save(permitRecord);
    }

    public List<BuildingPermitRecord> getAllPermitRecords() {
        return buildingPermitRecordRepository.findAll();
    }

    public BuildingPermitRecord getPermitRecordById(Long id) {
        return buildingPermitRecordRepository.findById(id)
                .orElseThrow(() ->
                        new BuildingPermitRecordNotFoundException("Building Permit Record not found"));
    }

    public List<BuildingPermitRecord> getPermitRecordsByPropertyId(
            Long propertyId) {
        return buildingPermitRecordRepository.findByPropertyId(propertyId);
    }
}