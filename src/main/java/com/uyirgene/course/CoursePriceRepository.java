package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CoursePriceRepository extends JpaRepository<CoursePrice, Long> {
    List<CoursePrice> findByCourse(Course course);
    Optional<CoursePrice> findByCourseAndCountryCode(Course course, String countryCode);
    void deleteByCourse(Course course);
}
