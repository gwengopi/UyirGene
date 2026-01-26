package com.uyirgene.course;

import com.uyirgene.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByUserAndCourse(User user, Course course);
    Optional<Certificate> findByCertificateId(String certificateId);
    void deleteByCourse(Course course);
}