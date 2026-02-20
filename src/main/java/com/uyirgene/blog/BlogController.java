package com.uyirgene.blog;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.List;
import java.util.Set;
import java.util.Map;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;

    // ==================== PUBLIC ENDPOINTS ====================

    @GetMapping
    @Operation(summary = "Get published blogs with pagination")
    @ApiResponse(responseCode = "200", description = "List of published blogs")
    public ResponseEntity<Page<Blog>> getPublishedBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(blogService.getPublishedBlogs(pageable));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all published blogs (no pagination)")
    @ApiResponse(responseCode = "200", description = "List of all published blogs")
    public ResponseEntity<List<Blog>> getAllPublishedBlogs() {
        return ResponseEntity.ok(blogService.getPublishedBlogs());
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get blog by URL slug")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Blog found"),
            @ApiResponse(responseCode = "404", description = "Blog not found")
    })
    public ResponseEntity<Blog> getBlogBySlug(@PathVariable String slug) {
        return blogService.getBlogBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get published blog by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Blog found"),
            @ApiResponse(responseCode = "404", description = "Blog not found or not published")
    })
    public ResponseEntity<Blog> getPublicBlogById(@PathVariable Long id) {
        return blogService.getPublicBlogById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get blogs by category")
    @ApiResponse(responseCode = "200", description = "List of blogs in category")
    public ResponseEntity<List<Blog>> getBlogsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(blogService.getBlogsByCategory(category));
    }

    @GetMapping("/search")
    @Operation(summary = "Search blogs")
    @ApiResponse(responseCode = "200", description = "Search results")
    public ResponseEntity<?> searchBlogs(@RequestParam String q) {
        if (q == null || q.isBlank() || q.length() > 100) {
            return ResponseEntity.badRequest().body(Map.of("error", "Search query must be 1-100 characters"));
        }
        return ResponseEntity.ok(blogService.searchBlogs(q.trim()));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent blogs")
    @ApiResponse(responseCode = "200", description = "List of recent blogs")
    public ResponseEntity<List<Blog>> getRecentBlogs() {
        return ResponseEntity.ok(blogService.getRecentBlogs());
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all categories with blog count")
    @ApiResponse(responseCode = "200", description = "List of categories with counts")
    public ResponseEntity<List<Object[]>> getCategoriesWithCount() {
        return ResponseEntity.ok(blogService.getCategoriesWithCount());
    }

    @GetMapping("/{id}/image")
    @Operation(summary = "Get blog featured image")
    public ResponseEntity<byte[]> getFeaturedImage(@PathVariable Long id) {
        return blogService.getPublicBlogById(id)
                .filter(blog -> blog.getFeaturedImage() != null)
                .map(blog -> {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.parseMediaType(
                            blog.getFeaturedImageContentType() != null
                                    ? blog.getFeaturedImageContentType()
                                    : "image/jpeg"));
                    return new ResponseEntity<>(blog.getFeaturedImage(), headers, HttpStatus.OK);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ==================== SUBSCRIPTION ENDPOINTS ====================

    @PostMapping("/subscribe")
    @Operation(summary = "Subscribe to blog newsletter")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Subscribed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid email")
    })
    public ResponseEntity<?> subscribe(@RequestBody SubscriptionRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        BlogSubscription subscription = blogService.subscribe(request.email(), request.name());
        return ResponseEntity.ok(Map.of(
                "message", "Successfully subscribed",
                "email", subscription.getEmail()
        ));
    }

    @GetMapping("/unsubscribe/{token}")
    @Operation(summary = "Unsubscribe from blog newsletter")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Unsubscribed successfully"),
            @ApiResponse(responseCode = "404", description = "Invalid token")
    })
    public ResponseEntity<?> unsubscribe(@PathVariable String token) {
        boolean success = blogService.unsubscribe(token);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Successfully unsubscribed"));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/subscribers/count")
    @Operation(summary = "Get subscriber count")
    public ResponseEntity<Map<String, Long>> getSubscriberCount() {
        return ResponseEntity.ok(Map.of("count", blogService.getSubscriberCount()));
    }

    // ==================== ADMIN ENDPOINTS ====================

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AUTHOR')")
    @Operation(summary = "Get all blogs (admin)")
    @ApiResponse(responseCode = "200", description = "List of all blogs")
    public ResponseEntity<List<Blog>> getAllBlogs() {
        return ResponseEntity.ok(blogService.getAllBlogs());
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AUTHOR')")
    @Operation(summary = "Get any blog by ID (admin)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Blog found"),
            @ApiResponse(responseCode = "404", description = "Blog not found")
    })
    public ResponseEntity<Blog> getAdminBlogById(@PathVariable Long id) {
        return blogService.getBlogById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AUTHOR')")
    @Operation(summary = "Create blog post")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Created"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<Blog> createBlog(@RequestBody Blog blog) {
        blog.setId(null);
        Blog saved = blogService.createBlog(blog);
        return ResponseEntity.created(URI.create("/api/blogs/" + saved.getId())).body(saved);
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AUTHOR')")
    @Operation(summary = "Update blog post")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Updated"),
            @ApiResponse(responseCode = "404", description = "Not found")
    })
    public ResponseEntity<Blog> updateBlog(@PathVariable Long id, @RequestBody Blog blog) {
        Blog updated = blogService.updateBlog(id, blog);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete blog post")
    @ApiResponse(responseCode = "204", description = "Deleted")
    public ResponseEntity<?> deleteBlog(@PathVariable Long id) {
        blogService.deleteBlog(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AUTHOR')")
    @Operation(summary = "Update blog status")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated"),
            @ApiResponse(responseCode = "404", description = "Blog not found")
    })
    public ResponseEntity<Blog> updateBlogStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        Blog updated = blogService.updateStatus(id, request.status());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/admin/{id}/image")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AUTHOR')")
    @Operation(summary = "Upload featured image")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Image uploaded"),
            @ApiResponse(responseCode = "404", description = "Blog not found")
    })
    public ResponseEntity<?> uploadFeaturedImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        String validationError = validateImage(file);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(Map.of("error", validationError));
        }
        Blog updated = blogService.updateFeaturedImage(
                id,
                file.getBytes(),
                file.getContentType());
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/admin/{id}/image")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AUTHOR')")
    @Operation(summary = "Get blog featured image (admin)")
    public ResponseEntity<byte[]> getAdminFeaturedImage(@PathVariable Long id) {
        return blogService.getBlogById(id)
                .filter(blog -> blog.getFeaturedImage() != null)
                .map(blog -> {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.parseMediaType(
                            blog.getFeaturedImageContentType() != null
                                    ? blog.getFeaturedImageContentType()
                                    : "image/jpeg"));
                    return new ResponseEntity<>(blog.getFeaturedImage(), headers, HttpStatus.OK);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/admin/subscribers")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all active subscribers")
    @ApiResponse(responseCode = "200", description = "List of active subscribers")
    public ResponseEntity<List<BlogSubscription>> getActiveSubscribers() {
        return ResponseEntity.ok(blogService.getActiveSubscribers());
    }

    // ==================== DTOs ====================

    // ==================== Validation ====================

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/gif", "image/webp");

    private String validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) return "No file provided";
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            return "Invalid image type. Allowed: JPEG, PNG, GIF, WebP";
        }
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[4];
            if (is.read(header) < 4) return "File too small to be a valid image";
            boolean valid = (header[0] == (byte) 0xFF && header[1] == (byte) 0xD8) ||
                    (header[0] == (byte) 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) ||
                    (header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46) ||
                    (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46);
            if (!valid) return "File content does not match a valid image format";
        } catch (IOException e) {
            return "Could not read image file";
        }
        return null;
    }

    // ==================== DTOs ====================

    public record SubscriptionRequest(String email, String name) {}

    public record StatusUpdateRequest(Blog.BlogStatus status) {}
}
