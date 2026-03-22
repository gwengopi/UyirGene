package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CourseBundleRepository extends JpaRepository<CourseBundle, Long> {

    @Query("SELECT b.title FROM CourseBundle b WHERE b.id = :id")
    Optional<String> findTitleById(@Param("id") Long id);
    Optional<CourseBundle> findBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
    boolean existsBySlug(String slug);
    List<CourseBundle> findByPublishedTrueOrderByDisplayOrderAscIdAsc();
    List<CourseBundle> findAllByOrderByDisplayOrderAscIdAsc();
    Optional<CourseBundle> findByBundleCode(String bundleCode);
    List<CourseBundle> findByPublishedTrueAndCategoryOrderByDisplayOrderAscIdAsc(String category);

    @Query("SELECT DISTINCT b FROM CourseBundle b JOIN b.courses c WHERE c.id = :courseId AND b.published = true ORDER BY b.displayOrder ASC, b.id ASC")
    List<CourseBundle> findPublishedBundlesByCourseId(@Param("courseId") Long courseId);

    /** Bundles that contain at least one course with the given category */
    @Query("SELECT DISTINCT b FROM CourseBundle b JOIN b.courses c WHERE c.category = :category AND b.published = true ORDER BY b.displayOrder ASC, b.id ASC")
    List<CourseBundle> findPublishedBundlesByCourseCategory(@Param("category") String category);
}
