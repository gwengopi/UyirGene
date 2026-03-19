package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("SELECT c.title FROM Course c WHERE c.id = :id")
    java.util.Optional<String> findTitleById(@Param("id") Long id);
    java.util.Optional<Course> findByCourseCodeIgnoreCase(String courseCode);
    boolean existsByCourseCodeIgnoreCaseAndIdNot(String courseCode, Long id);
    java.util.List<Course> findByFlagshipTrue();
    java.util.List<Course> findByPublishedTrueOrderByDisplayOrderAscIdAsc();
    java.util.List<Course> findByFlagshipTrueAndPublishedTrueOrderByDisplayOrderAscIdAsc();
    java.util.List<Course> findAllByOrderByDisplayOrderAscIdAsc();
    java.util.List<Course> findByPublishedTrueAndCategoryOrderByDisplayOrderAscIdAsc(String category);
    java.util.List<Course> findByPublishedTrueAndCategoryNotOrderByDisplayOrderAscIdAsc(String category);
}
