package com.uyirgene.blog;

import com.uyirgene.course.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlogService {

    private final BlogRepository blogRepo;
    private final BlogSubscriptionRepository subscriptionRepo;
    private final MailService mailService;

    // ==================== PUBLIC BLOG METHODS ====================

    /**
     * Get all published public blogs
     */
    public List<Blog> getPublishedBlogs() {
        return blogRepo.findByStatusAndVisibilityOrderByPublishDateDesc(
                Blog.BlogStatus.PUBLISHED, Blog.BlogVisibility.PUBLIC);
    }

    /**
     * Get published blogs with pagination
     */
    public Page<Blog> getPublishedBlogs(Pageable pageable) {
        return blogRepo.findByStatusAndVisibilityOrderByPublishDateDesc(
                Blog.BlogStatus.PUBLISHED, Blog.BlogVisibility.PUBLIC, pageable);
    }

    /**
     * Get blog by URL slug (public)
     */
    public Optional<Blog> getBlogBySlug(String slug) {
        Optional<Blog> blogOpt = blogRepo.findByUrlSlug(slug);
        // Increment view count
        blogOpt.ifPresent(blog -> {
            blog.setViewCount(blog.getViewCount() + 1);
            blogRepo.save(blog);
        });
        return blogOpt;
    }

    /**
     * Get blog by ID (public - only if published and public)
     */
    public Optional<Blog> getPublicBlogById(Long id) {
        return blogRepo.findById(id)
                .filter(b -> b.getStatus() == Blog.BlogStatus.PUBLISHED
                        && b.getVisibility() == Blog.BlogVisibility.PUBLIC);
    }

    /**
     * Get blogs by category
     */
    public List<Blog> getBlogsByCategory(String category) {
        return blogRepo.findByCategoryAndStatusAndVisibilityOrderByPublishDateDesc(
                category, Blog.BlogStatus.PUBLISHED, Blog.BlogVisibility.PUBLIC);
    }

    /**
     * Search blogs
     */
    public List<Blog> searchBlogs(String query) {
        return blogRepo.searchBlogs(query, Blog.BlogStatus.PUBLISHED, Blog.BlogVisibility.PUBLIC);
    }

    /**
     * Get recent blogs
     */
    public List<Blog> getRecentBlogs() {
        return blogRepo.findTop5ByStatusAndVisibilityOrderByPublishDateDesc(
                Blog.BlogStatus.PUBLISHED, Blog.BlogVisibility.PUBLIC);
    }

    /**
     * Get categories with count
     */
    public List<Object[]> getCategoriesWithCount() {
        return blogRepo.getCategoriesWithCount();
    }

    // ==================== ADMIN BLOG METHODS ====================

    /**
     * Get all blogs (admin)
     */
    public List<Blog> getAllBlogs() {
        return blogRepo.findAll();
    }

    /**
     * Get blog by ID (admin - any status)
     */
    public Optional<Blog> getBlogById(Long id) {
        return blogRepo.findById(id);
    }

    /**
     * Create a new blog
     */
    @Transactional
    public Blog createBlog(Blog blog) {
        // Generate unique slug
        String baseSlug = Blog.generateSlug(blog.getTitle());
        String slug = baseSlug;
        int counter = 1;
        while (blogRepo.existsByUrlSlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }
        blog.setUrlSlug(slug);

        // Set publish date if publishing
        if (blog.getStatus() == Blog.BlogStatus.PUBLISHED && blog.getPublishDate() == null) {
            blog.setPublishDate(LocalDateTime.now());
        }

        Blog saved = blogRepo.save(blog);
        log.info("Blog created: {} (slug: {})", saved.getTitle(), saved.getUrlSlug());

        // Notify subscribers if published
        if (saved.getStatus() == Blog.BlogStatus.PUBLISHED) {
            notifySubscribers(saved);
        }

        return saved;
    }

    /**
     * Update an existing blog
     */
    @Transactional
    public Blog updateBlog(Long id, Blog blogData) {
        Blog existing = blogRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found: " + id));

        boolean wasNotPublished = existing.getStatus() != Blog.BlogStatus.PUBLISHED;

        // Update fields (preserve createdAt and urlSlug unless explicitly changed)
        existing.setTitle(blogData.getTitle());
        existing.setShortDescription(blogData.getShortDescription());
        existing.setContent(blogData.getContent());
        existing.setAuthorName(blogData.getAuthorName());
        existing.setCategory(blogData.getCategory());
        existing.setTags(blogData.getTags());
        existing.setStatus(blogData.getStatus());
        existing.setVisibility(blogData.getVisibility());
        existing.setLanguage(blogData.getLanguage());

        // Update slug only if explicitly provided and different
        if (blogData.getUrlSlug() != null && !blogData.getUrlSlug().equals(existing.getUrlSlug())) {
            if (!blogRepo.existsByUrlSlug(blogData.getUrlSlug())) {
                existing.setUrlSlug(blogData.getUrlSlug());
            }
        }

        // Set publish date if transitioning to published
        if (blogData.getStatus() == Blog.BlogStatus.PUBLISHED) {
            if (existing.getPublishDate() == null) {
                existing.setPublishDate(LocalDateTime.now());
            }
        }

        // Handle scheduled publish date
        if (blogData.getStatus() == Blog.BlogStatus.SCHEDULED && blogData.getPublishDate() != null) {
            existing.setPublishDate(blogData.getPublishDate());
        }

        Blog saved = blogRepo.save(existing);
        log.info("Blog updated: {} (id: {})", saved.getTitle(), saved.getId());

        // Notify subscribers if just published
        if (wasNotPublished && saved.getStatus() == Blog.BlogStatus.PUBLISHED) {
            notifySubscribers(saved);
        }

        return saved;
    }

    /**
     * Delete a blog
     */
    @Transactional
    public void deleteBlog(Long id) {
        Blog blog = blogRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found: " + id));
        blogRepo.delete(blog);
        log.info("Blog deleted: {} (id: {})", blog.getTitle(), id);
    }

    /**
     * Update blog status
     */
    @Transactional
    public Blog updateStatus(Long id, Blog.BlogStatus status) {
        Blog blog = blogRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found: " + id));

        boolean wasNotPublished = blog.getStatus() != Blog.BlogStatus.PUBLISHED;
        blog.setStatus(status);

        if (status == Blog.BlogStatus.PUBLISHED && blog.getPublishDate() == null) {
            blog.setPublishDate(LocalDateTime.now());
        }

        Blog saved = blogRepo.save(blog);

        // Notify subscribers if just published
        if (wasNotPublished && status == Blog.BlogStatus.PUBLISHED) {
            notifySubscribers(saved);
        }

        return saved;
    }

    /**
     * Update featured image
     */
    @Transactional
    public Blog updateFeaturedImage(Long id, byte[] image, String contentType) {
        Blog blog = blogRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Blog not found: " + id));
        blog.setFeaturedImage(image);
        blog.setFeaturedImageContentType(contentType);
        return blogRepo.save(blog);
    }

    // ==================== SUBSCRIPTION METHODS ====================

    /**
     * Subscribe to blog notifications
     */
    @Transactional
    public BlogSubscription subscribe(String email, String name) {
        Optional<BlogSubscription> existing = subscriptionRepo.findByEmail(email);
        if (existing.isPresent()) {
            BlogSubscription sub = existing.get();
            if (!sub.getActive()) {
                sub.setActive(true);
                sub.setUnsubscribedAt(null);
                sub.setName(name);
                return subscriptionRepo.save(sub);
            }
            return sub; // Already subscribed
        }

        BlogSubscription subscription = BlogSubscription.builder()
                .email(email)
                .name(name)
                .active(true)
                .build();
        return subscriptionRepo.save(subscription);
    }

    /**
     * Unsubscribe using token
     */
    @Transactional
    public boolean unsubscribe(String token) {
        Optional<BlogSubscription> subOpt = subscriptionRepo.findByUnsubscribeToken(token);
        if (subOpt.isPresent()) {
            BlogSubscription sub = subOpt.get();
            sub.setActive(false);
            sub.setUnsubscribedAt(LocalDateTime.now());
            subscriptionRepo.save(sub);
            return true;
        }
        return false;
    }

    /**
     * Get active subscribers count
     */
    public long getSubscriberCount() {
        return subscriptionRepo.countByActiveTrue();
    }

    /**
     * Get all active subscribers (admin)
     */
    public List<BlogSubscription> getActiveSubscribers() {
        return subscriptionRepo.findByActiveTrue();
    }

    /**
     * Notify subscribers about new blog post
     */
    private void notifySubscribers(Blog blog) {
        List<BlogSubscription> subscribers = subscriptionRepo.findByActiveTrue();
        if (subscribers.isEmpty()) {
            log.info("No active subscribers to notify for blog: {}", blog.getTitle());
            return;
        }

        log.info("Notifying {} subscribers about new blog: {}", subscribers.size(), blog.getTitle());

        // Send email notifications asynchronously
        mailService.sendNewBlogNotification(subscribers, blog);
    }
}
