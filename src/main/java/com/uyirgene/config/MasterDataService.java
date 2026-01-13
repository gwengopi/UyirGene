package com.uyirgene.config;

import com.uyirgene.exception.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MasterDataService {

    private final MasterDataRepository repository;

    // Common data types
    public static final String TYPE_COURSE_CATEGORY = "COURSE_CATEGORY";
    public static final String TYPE_SKILL_LEVEL = "SKILL_LEVEL";
    public static final String TYPE_DURATION_TYPE = "DURATION_TYPE";
    public static final String TYPE_ENROLLMENT_STATUS = "ENROLLMENT_STATUS";

    /**
     * Get all master data entries (for admin)
     */
    public List<MasterData> getAllMasterData() {
        return repository.findAll();
    }

    /**
     * Get active master data by type
     */
    @Cacheable(value = "masterData", key = "#dataType")
    public List<MasterData> getByType(String dataType) {
        return repository.findByDataTypeAndActiveTrueOrderByDisplayOrderAsc(dataType);
    }

    /**
     * Get all master data by type (including inactive, for admin)
     */
    public List<MasterData> getByTypeAdmin(String dataType) {
        return repository.findByDataTypeOrderByDisplayOrderAsc(dataType);
    }

    /**
     * Get master data by type and code
     */
    public MasterData getByTypeAndCode(String dataType, String code) {
        return repository.findByDataTypeAndCode(dataType, code)
                .orElseThrow(() -> new EntityNotFoundException("Master data not found"));
    }

    /**
     * Get child master data entries
     */
    public List<MasterData> getChildren(Long parentId) {
        return repository.findByParentIdOrderByDisplayOrderAsc(parentId);
    }

    /**
     * Get all distinct data types
     */
    public List<String> getAllDataTypes() {
        return repository.findAll().stream()
                .map(MasterData::getDataType)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Create a new master data entry
     */
    @Transactional
    @CacheEvict(value = "masterData", key = "#masterData.dataType")
    public MasterData create(MasterData masterData) {
        if (repository.existsByDataTypeAndCode(masterData.getDataType(), masterData.getCode())) {
            throw new IllegalArgumentException("Entry with type '" + masterData.getDataType() + "' and code '" + masterData.getCode() + "' already exists");
        }
        return repository.save(masterData);
    }

    /**
     * Update an existing master data entry
     */
    @Transactional
    @CacheEvict(value = "masterData", allEntries = true)
    public MasterData update(Long id, MasterData updates) {
        MasterData data = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Master data not found"));

        if (updates.getLabel() != null) data.setLabel(updates.getLabel());
        if (updates.getDescription() != null) data.setDescription(updates.getDescription());
        if (updates.getIconUrl() != null) data.setIconUrl(updates.getIconUrl());
        if (updates.getDisplayOrder() != null) data.setDisplayOrder(updates.getDisplayOrder());
        if (updates.getActive() != null) data.setActive(updates.getActive());
        if (updates.getMetadata() != null) data.setMetadata(updates.getMetadata());

        return repository.save(data);
    }

    /**
     * Delete a master data entry
     */
    @Transactional
    @CacheEvict(value = "masterData", allEntries = true)
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Master data not found");
        }
        repository.deleteById(id);
    }

    /**
     * Seed default master data
     */
    @Transactional
    @CacheEvict(value = "masterData", allEntries = true)
    public void seedDefaultData() {
        // Course Categories
        seedCategory(TYPE_COURSE_CATEGORY, "PROGRAMMING", "Programming", 1);
        seedCategory(TYPE_COURSE_CATEGORY, "WEB_DEVELOPMENT", "Web Development", 2);
        seedCategory(TYPE_COURSE_CATEGORY, "MOBILE_DEVELOPMENT", "Mobile Development", 3);
        seedCategory(TYPE_COURSE_CATEGORY, "DATA_SCIENCE", "Data Science", 4);
        seedCategory(TYPE_COURSE_CATEGORY, "MACHINE_LEARNING", "Machine Learning", 5);
        seedCategory(TYPE_COURSE_CATEGORY, "FOOD_SAFETY", "Food Safety", 6);
        seedCategory(TYPE_COURSE_CATEGORY, "QUALITY_MANAGEMENT", "Quality Management", 7);
        seedCategory(TYPE_COURSE_CATEGORY, "ISO_STANDARDS", "ISO Standards", 8);
        seedCategory(TYPE_COURSE_CATEGORY, "MICROBIOLOGY", "Microbiology", 9);
        seedCategory(TYPE_COURSE_CATEGORY, "REGULATORY", "Regulatory Compliance", 10);
        seedCategory(TYPE_COURSE_CATEGORY, "BUSINESS", "Business", 11);
        seedCategory(TYPE_COURSE_CATEGORY, "DESIGN", "Design", 12);
        seedCategory(TYPE_COURSE_CATEGORY, "OTHER", "Other", 99);

        // Skill Levels
        seedCategory(TYPE_SKILL_LEVEL, "BEGINNER", "Beginner", 1);
        seedCategory(TYPE_SKILL_LEVEL, "INTERMEDIATE", "Intermediate", 2);
        seedCategory(TYPE_SKILL_LEVEL, "ADVANCED", "Advanced", 3);
        seedCategory(TYPE_SKILL_LEVEL, "EXPERT", "Expert", 4);

        // Duration Types
        seedCategory(TYPE_DURATION_TYPE, "SELF_PACED", "Self-Paced", 1);
        seedCategory(TYPE_DURATION_TYPE, "FIXED_SCHEDULE", "Fixed Schedule", 2);
        seedCategory(TYPE_DURATION_TYPE, "LIVE_CLASSES", "Live Classes", 3);
    }

    private void seedCategory(String dataType, String code, String label, int order) {
        if (!repository.existsByDataTypeAndCode(dataType, code)) {
            repository.save(MasterData.builder()
                    .dataType(dataType)
                    .code(code)
                    .label(label)
                    .displayOrder(order)
                    .active(true)
                    .build());
        }
    }
}
