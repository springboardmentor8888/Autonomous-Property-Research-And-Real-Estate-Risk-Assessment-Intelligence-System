package com.realestate.backend.controller;

import com.realestate.backend.entity.FloodStorage;
import com.realestate.backend.repository.FloodStorageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/flood-storage")
public class FloodStorageController {

private final FloodStorageRepository repository;

public FloodStorageController(FloodStorageRepository repository) {
    this.repository = repository;
}

@GetMapping
public List<FloodStorage> getAll() {
    return repository.findAll();
}

@GetMapping("/{id}")
public ResponseEntity<FloodStorage> getById(@PathVariable Long id) {
    return repository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

@PostMapping
public FloodStorage create(@RequestBody FloodStorage floodStorage) {
    return repository.save(floodStorage);
}

@PutMapping("/{id}")
public ResponseEntity<FloodStorage> update(@PathVariable Long id, @RequestBody FloodStorage floodStorage) {
    return repository.findById(id)
            .map(existing -> {
                existing.setStorageArea(floodStorage.getStorageArea());
                existing.setStorageVolume(floodStorage.getStorageVolume());
                existing.setFloodZone(floodStorage.getFloodZone());
                existing.setRiskLevel(floodStorage.getRiskLevel());
                existing.setDescription(floodStorage.getDescription());
                existing.setStatus(floodStorage.getStatus());
                return ResponseEntity.ok(repository.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable Long id) {
    if (!repository.existsById(id)) {
        return ResponseEntity.notFound().build();
    }

    repository.deleteById(id);
    return ResponseEntity.noContent().build();
}

}