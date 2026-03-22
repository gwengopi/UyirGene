package com.uyirgene.service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceTestingRepository extends JpaRepository<ServiceTesting, Long> {
    List<ServiceTesting> findByPublishedTrueOrderByDisplayOrderAsc();
    List<ServiceTesting> findAllByOrderByDisplayOrderAsc();
    java.util.Optional<ServiceTesting> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySlugAndIdNot(String slug, Long id);
}
