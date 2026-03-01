package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlagshipProgramRepository extends JpaRepository<FlagshipProgram, Long> {

    @Query("SELECT p.title FROM FlagshipProgram p WHERE p.id = :id")
    Optional<String> findTitleById(@Param("id") Long id);

    @Query("SELECT p.title FROM FlagshipProgram p WHERE p.slug = :slug")
    Optional<String> findTitleBySlug(@Param("slug") String slug);

    List<FlagshipProgram> findByActiveTrueOrderByDisplayOrderAscIdAsc();

    List<FlagshipProgram> findAllByOrderByDisplayOrderAscIdAsc();

    Optional<FlagshipProgram> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);

    java.util.Optional<FlagshipProgram> findByProgramCodeIgnoreCase(String programCode);

    boolean existsByProgramCode(String programCode);

    boolean existsByProgramCodeAndIdNot(String programCode, Long id);
}
