package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlagshipProgramRepository extends JpaRepository<FlagshipProgram, Long> {

    List<FlagshipProgram> findByActiveTrueOrderByDisplayOrderAscIdAsc();

    List<FlagshipProgram> findAllByOrderByDisplayOrderAscIdAsc();

    Optional<FlagshipProgram> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    java.util.Optional<FlagshipProgram> findByProgramCodeIgnoreCase(String programCode);

    boolean existsByProgramCode(String programCode);

    boolean existsByProgramCodeAndIdNot(String programCode, Long id);
}
