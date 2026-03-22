package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c.title FROM Course c WHERE c.id = :id")
    java.util.Optional<String> findTitleById(@Param("id") Long id);
    java.util.Optional<Course> findBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
    boolean existsBySlug(String slug);
    java.util.Optional<Course> findByCourseCodeIgnoreCase(String courseCode);
    boolean existsByCourseCodeIgnoreCaseAndIdNot(String courseCode, Long id);
    java.util.List<Course> findByFlagshipTrue();
    java.util.List<Course> findByPublishedTrueOrderByDisplayOrderAscIdAsc();
    java.util.List<Course> findByFlagshipTrueAndPublishedTrueOrderByDisplayOrderAscIdAsc();
    java.util.List<Course> findAllByOrderByDisplayOrderAscIdAsc();
    @Query("SELECT c FROM Course c WHERE c.published = true AND c.category LIKE %:pattern% ORDER BY c.displayOrder ASC, c.id ASC")
    java.util.List<Course> findByPublishedTrueAndCategoryContaining(@Param("pattern") String pattern);

    @Query("SELECT c FROM Course c WHERE c.published = true AND (c.category IS NULL OR c.category NOT LIKE %:pattern%) ORDER BY c.displayOrder ASC, c.id ASC")
    java.util.List<Course> findByPublishedTrueAndCategoryNotContaining(@Param("pattern") String pattern);
}
