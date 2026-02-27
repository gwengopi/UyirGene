package com.uyirgene.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StandardRepository extends JpaRepository<Standard, Long> {

    List<Standard> findAllByOrderByDisplayOrderAscCreatedAtDesc();

    @Query("SELECT s FROM Standard s WHERE " +
           "LOWER(s.title) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(s.category) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY s.displayOrder ASC, s.createdAt DESC")
    List<Standard> search(@Param("q") String query);
}
