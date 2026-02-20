package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
    java.util.List<Course> findByFlagshipTrue();
    java.util.List<Course> findByPublishedTrueOrderByDisplayOrderAscIdAsc();
    java.util.List<Course> findByFlagshipTrueAndPublishedTrueOrderByDisplayOrderAscIdAsc();
    java.util.List<Course> findAllByOrderByDisplayOrderAscIdAsc();
    java.util.List<Course> findByPublishedTrueAndCategoryOrderByDisplayOrderAscIdAsc(String category);
    java.util.List<Course> findByPublishedTrueAndCategoryNotOrderByDisplayOrderAscIdAsc(String category);
}
