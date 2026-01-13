package com.uyirgene.config;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master-data")
@RequiredArgsConstructor
@Tag(name = "Master Data", description = "Master data management for dropdowns")
public class MasterDataController {

    private final MasterDataService masterDataService;

    // ========== Public endpoints ==========

    @GetMapping("/type/{dataType}")
    @Operation(summary = "Get master data by type")
    public ResponseEntity<List<MasterData>> getByType(@PathVariable("dataType") String dataType) {
        return ResponseEntity.ok(masterDataService.getByType(dataType));
    }

    @GetMapping("/types")
    @Operation(summary = "Get all available data types")
    public ResponseEntity<List<String>> getAllTypes() {
        return ResponseEntity.ok(masterDataService.getAllDataTypes());
    }

    @GetMapping("/categories")
    @Operation(summary = "Get course categories")
    public ResponseEntity<List<MasterData>> getCourseCategories() {
        return ResponseEntity.ok(masterDataService.getByType(MasterDataService.TYPE_COURSE_CATEGORY));
    }

    @GetMapping("/skill-levels")
    @Operation(summary = "Get skill levels")
    public ResponseEntity<List<MasterData>> getSkillLevels() {
        return ResponseEntity.ok(masterDataService.getByType(MasterDataService.TYPE_SKILL_LEVEL));
    }

    // ========== Admin endpoints ==========

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Get all master data (admin)")
    public ResponseEntity<List<MasterData>> getAllMasterData() {
        return ResponseEntity.ok(masterDataService.getAllMasterData());
    }

    @GetMapping("/admin/type/{dataType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INSTRUCTOR')")
    @Operation(summary = "Get master data by type including inactive (admin)")
    public ResponseEntity<List<MasterData>> getByTypeAdmin(@PathVariable("dataType") String dataType) {
        return ResponseEntity.ok(masterDataService.getByTypeAdmin(dataType));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new master data entry")
    public ResponseEntity<MasterData> create(@RequestBody MasterData masterData) {
        return ResponseEntity.ok(masterDataService.create(masterData));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a master data entry")
    public ResponseEntity<MasterData> update(
            @PathVariable("id") Long id,
            @RequestBody MasterData masterData) {
        return ResponseEntity.ok(masterDataService.update(id, masterData));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a master data entry")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        masterDataService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/seed")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Seed default master data")
    public ResponseEntity<String> seedDefaults() {
        masterDataService.seedDefaultData();
        return ResponseEntity.ok("Default master data seeded successfully");
    }
}
