package com.uyirgene.service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceDiagnosticsRepository extends JpaRepository<ServiceDiagnostics, Long> {
    List<ServiceDiagnostics> findByPublishedTrueOrderByDisplayOrderAsc();
    List<ServiceDiagnostics> findAllByOrderByDisplayOrderAsc();
}
