package com.uyirgene.service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CareerRepository extends JpaRepository<Career, Long> {
    List<Career> findByPublishedTrueOrderByDisplayOrderAsc();
    List<Career> findAllByOrderByDisplayOrderAsc();
}
