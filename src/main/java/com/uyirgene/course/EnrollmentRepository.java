package com.uyirgene.course;

import com.uyirgene.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByUserAndCourse(User user, Course course);
    List<Enrollment> findByUser(User user);
    List<Enrollment> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}