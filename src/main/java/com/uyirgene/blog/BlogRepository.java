package com.uyirgene.blog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BlogRepository extends JpaRepository<Blog, Long> {

    // Find by URL slug
    Optional<Blog> findByUrlSlug(String urlSlug);

    // Find published blogs (public visibility)
    List<Blog> findByStatusAndVisibilityOrderByPublishDateDesc(
            Blog.BlogStatus status, Blog.BlogVisibility visibility);

    // Find published blogs with pagination
    Page<Blog> findByStatusAndVisibilityOrderByPublishDateDesc(
            Blog.BlogStatus status, Blog.BlogVisibility visibility, Pageable pageable);

    // Find by category
    List<Blog> findByCategoryAndStatusAndVisibilityOrderByPublishDateDesc(
            String category, Blog.BlogStatus status, Blog.BlogVisibility visibility);

    // Find by status (for admin)
    List<Blog> findByStatusOrderByUpdatedAtDesc(Blog.BlogStatus status);

    // Search in title and content
    @Query("SELECT b FROM Blog b WHERE " +
            "(LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(b.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(b.tags) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND b.status = :status AND b.visibility = :visibility " +
            "ORDER BY b.publishDate DESC")
    List<Blog> searchBlogs(@Param("query") String query,
                           @Param("status") Blog.BlogStatus status,
                           @Param("visibility") Blog.BlogVisibility visibility);

    // Get all categories with count
    @Query("SELECT b.category, COUNT(b) FROM Blog b " +
            "WHERE b.status = 'PUBLISHED' AND b.visibility = 'PUBLIC' " +
            "GROUP BY b.category ORDER BY COUNT(b) DESC")
    List<Object[]> getCategoriesWithCount();

    // Find recent blogs
    List<Blog> findTop5ByStatusAndVisibilityOrderByPublishDateDesc(
            Blog.BlogStatus status, Blog.BlogVisibility visibility);

    // Check if slug exists
    boolean existsByUrlSlug(String urlSlug);
}
