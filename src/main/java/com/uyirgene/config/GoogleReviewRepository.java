package com.uyirgene.config;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoogleReviewRepository extends JpaRepository<GoogleReview, Long> {

    List<GoogleReview> findByActiveTrueOrderByPublishTimeDesc();

    List<GoogleReview> findBySourceOrderByPublishTimeDesc(String source);

    void deleteBySource(String source);
}
