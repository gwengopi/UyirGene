package com.uyirgene.config;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SiteConfigRepository extends JpaRepository<SiteConfig, Long> {

    Optional<SiteConfig> findByKey(String key);

    List<SiteConfig> findByCategory(String category);

    List<SiteConfig> findByCategoryAndActiveTrue(String category);

    List<SiteConfig> findByType(String type);

    List<SiteConfig> findByActiveTrue();

    boolean existsByKey(String key);
}
