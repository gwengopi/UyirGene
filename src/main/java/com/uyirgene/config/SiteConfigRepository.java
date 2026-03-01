package com.uyirgene.config;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SiteConfig s WHERE s.key = :key")
    Optional<SiteConfig> findByKeyWithLock(@Param("key") String key);
}
