package com.uyirgene.config;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PageViewRepository extends JpaRepository<PageView, Long> {

    @Query("SELECT COUNT(DISTINCT p.sessionId) FROM PageView p WHERE p.viewedAt > :since")
    long countDistinctSessionsByViewedAtAfter(@Param("since") LocalDateTime since);

    long countByViewedAtAfter(LocalDateTime since);

    @Query(value = "SELECT path, COUNT(*) AS cnt FROM page_view WHERE viewed_at > :since GROUP BY path ORDER BY cnt DESC LIMIT :limit",
           nativeQuery = true)
    List<Object[]> findTopPathsByViewedAtAfter(@Param("since") LocalDateTime since, @Param("limit") int limit);

    @Query(value = "SELECT DATE(viewed_at) AS day, COUNT(*) AS cnt FROM page_view WHERE viewed_at BETWEEN :from AND :to GROUP BY DATE(viewed_at) ORDER BY day",
           nativeQuery = true)
    List<Object[]> findDailyCountsByViewedAtBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    long countByDeviceTypeAndViewedAtAfter(String deviceType, LocalDateTime since);

    /** Returns one row: [desktop_count, mobile_count, tablet_count] */
    @Query(value = """
            SELECT
              COUNT(*) FILTER (WHERE device_type = 'desktop') AS desktop,
              COUNT(*) FILTER (WHERE device_type = 'mobile')  AS mobile,
              COUNT(*) FILTER (WHERE device_type = 'tablet')  AS tablet
            FROM page_view
            WHERE viewed_at > :since
            """, nativeQuery = true)
    List<Object[]> countDeviceBreakdownSince(@Param("since") LocalDateTime since);
}
