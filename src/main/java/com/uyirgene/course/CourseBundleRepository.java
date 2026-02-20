package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseBundleRepository extends JpaRepository<CourseBundle, Long> {
    List<CourseBundle> findByPublishedTrueOrderByDisplayOrderAscIdAsc();
    List<CourseBundle> findAllByOrderByDisplayOrderAscIdAsc();
    Optional<CourseBundle> findByBundleCode(String bundleCode);
    List<CourseBundle> findByPublishedTrueAndCategoryOrderByDisplayOrderAscIdAsc(String category);
}
