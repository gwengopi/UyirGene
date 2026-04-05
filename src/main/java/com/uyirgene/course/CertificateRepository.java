package com.uyirgene.course;

import com.uyirgene.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByUserAndCourse(User user, Course course);
    Optional<Certificate> findByUserAndFlagshipProgram(User user, FlagshipProgram flagshipProgram);
    Optional<Certificate> findByCertificateId(String certificateId);
    void deleteByCourse(Course course);
    void deleteByUser(User user);
    List<Certificate> findByUser(User user);
}