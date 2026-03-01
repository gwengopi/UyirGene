package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ManualDocumentRepository extends JpaRepository<ManualDocument, Long> {

    List<ManualDocument> findByCourse_IdOrderByDisplayOrderAscCreatedAtAsc(Long courseId);

    List<ManualDocument> findByFlagshipProgram_IdOrderByDisplayOrderAscCreatedAtAsc(Long flagshipProgramId);

    Optional<ManualDocument> findByIdAndCourse_Id(Long id, Long courseId);

    Optional<ManualDocument> findByIdAndFlagshipProgram_Id(Long id, Long flagshipProgramId);
}
