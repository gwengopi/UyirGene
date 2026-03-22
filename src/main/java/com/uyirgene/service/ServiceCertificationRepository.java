package com.uyirgene.service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceCertificationRepository extends JpaRepository<ServiceCertification, Long> {
    List<ServiceCertification> findByPublishedTrueOrderByDisplayOrderAsc();
    List<ServiceCertification> findAllByOrderByDisplayOrderAsc();
    java.util.Optional<ServiceCertification> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
}
