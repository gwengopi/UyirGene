package com.uyirgene.config;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<Faq, Long> {

    /**
     * Find all active FAQs ordered by category and display order
     */
    List<Faq> findByActiveTrueOrderByCategoryAscDisplayOrderAsc();

    /**
     * Find active FAQs by category
     */
    List<Faq> findByCategoryAndActiveTrueOrderByDisplayOrderAsc(String category);

    /**
     * Find all FAQs by category (including inactive)
     */
    List<Faq> findByCategoryOrderByDisplayOrderAsc(String category);

    /**
     * Get max display order for a category
     */
    @Query("SELECT COALESCE(MAX(f.displayOrder), 0) FROM Faq f WHERE f.category = :category")
    Integer findMaxDisplayOrderByCategory(String category);

    /**
     * Count FAQs by category
     */
    Long countByCategory(String category);

    /**
     * Count active FAQs by category
     */
    Long countByCategoryAndActiveTrue(String category);
}
