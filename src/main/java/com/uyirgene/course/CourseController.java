package com.uyirgene.course;

import com.uyirgene.course.dto.CourseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseRepository repo;
    private final VideoRepository videoRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final CertificateRepository certificateRepo;
    private final VideoProgressRepository videoProgressRepo;

    @GetMapping
    @Operation(summary = "List all courses with optional sorting")
    @ApiResponse(responseCode = "200", description = "List of courses")
    public ResponseEntity<List<CourseDto>> all(
            @RequestParam(value = "sortBy", required = false) String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "asc") String sortOrder
    ) {
        List<Course> courses = repo.findAll();

        // Apply sorting
        if (sortBy != null) {
            Comparator<Course> comparator = switch (sortBy.toLowerCase()) {
                case "duration", "durationhours" -> Comparator.comparing(
                        Course::getDurationHours,
                        Comparator.nullsLast(Comparator.naturalOrder())
                );
                case "price" -> Comparator.comparing(
                        Course::getPrice,
                        Comparator.nullsLast(Comparator.naturalOrder())
                );
                case "title" -> Comparator.comparing(
                        Course::getTitle,
                        Comparator.nullsLast(Comparator.naturalOrder())
                );
                default -> null;
            };

            if (comparator != null) {
                if ("desc".equalsIgnoreCase(sortOrder)) {
                    comparator = comparator.reversed();
                }
                courses = courses.stream().sorted(comparator).collect(Collectors.toList());
            }
        }

        List<CourseDto> courseDtos = courses.stream()
                .map(CourseDto::fromEntity)
                .toList();
        return ResponseEntity.ok(courseDtos);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Create a course with optional images")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Course created"),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<CourseDto> create(
            @RequestParam(value = "courseCode", required = false) String courseCode,
            @RequestParam("title") String title,
            @RequestParam(value = "shortDescription", required = false) String shortDescription,
            @RequestParam("description") String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "durationHours", required = false) Integer durationHours,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "published", defaultValue = "false") Boolean published,
            @RequestParam(value = "trainerName", required = false) String trainerName,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage,
            @RequestParam(value = "descriptionImage", required = false) MultipartFile descriptionImage,
            @RequestParam(value = "testLink", required = false) String testLink,
            @RequestParam(value = "testDescription", required = false) String testDescription
    ) throws IOException {
        Course course = Course.builder()
                .courseCode(courseCode)
                .title(title)
                .shortDescription(shortDescription)
                .description(description)
                .category(category)
                .durationHours(durationHours)
                .price(price)
                .published(published)
                .trainerName(trainerName)
                .testLink(testLink)
                .testDescription(testDescription)
                .build();

        // Handle legacy image field
        if (image != null && !image.isEmpty()) {
            course.setImage(image.getBytes());
            course.setImageContentType(image.getContentType());
        }

        // Handle thumbnail image (use dedicated field or fall back to legacy)
        if (thumbnailImage != null && !thumbnailImage.isEmpty()) {
            course.setThumbnailImage(thumbnailImage.getBytes());
            course.setThumbnailImageContentType(thumbnailImage.getContentType());
        } else if (image != null && !image.isEmpty()) {
            // If only legacy image provided, also set it as thumbnail
            course.setThumbnailImage(image.getBytes());
            course.setThumbnailImageContentType(image.getContentType());
        }

        // Handle description image
        if (descriptionImage != null && !descriptionImage.isEmpty()) {
            course.setDescriptionImage(descriptionImage.getBytes());
            course.setDescriptionImageContentType(descriptionImage.getContentType());
        }

        Course saved = repo.save(course);
        return ResponseEntity.created(URI.create("/api/courses/" + saved.getId()))
                .body(CourseDto.fromEntity(saved));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Create a course (JSON)")
    public ResponseEntity<CourseDto> createJson(@RequestBody Course c) {
        c.setId(null);
        Course saved = repo.save(c);
        return ResponseEntity.created(URI.create("/api/courses/" + saved.getId()))
                .body(CourseDto.fromEntity(saved));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single course")
    public ResponseEntity<CourseDto> get(@PathVariable("id") Long id) {
        return repo.findById(id)
                .map(course -> ResponseEntity.ok(CourseDto.fromEntity(course)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Update a course with optional images")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Course updated"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<CourseDto> update(
            @PathVariable("id") Long id,
            @RequestParam(value = "courseCode", required = false) String courseCode,
            @RequestParam("title") String title,
            @RequestParam(value = "shortDescription", required = false) String shortDescription,
            @RequestParam("description") String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "durationHours", required = false) Integer durationHours,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "published", defaultValue = "false") Boolean published,
            @RequestParam(value = "trainerName", required = false) String trainerName,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage,
            @RequestParam(value = "descriptionImage", required = false) MultipartFile descriptionImage,
            @RequestParam(value = "testLink", required = false) String testLink,
            @RequestParam(value = "testDescription", required = false) String testDescription,
            @RequestParam(value = "removeImage", defaultValue = "false") Boolean removeImage,
            @RequestParam(value = "removeThumbnailImage", defaultValue = "false") Boolean removeThumbnailImage,
            @RequestParam(value = "removeDescriptionImage", defaultValue = "false") Boolean removeDescriptionImage
    ) throws IOException {
        return repo.findById(id).map(existing -> {
            existing.setCourseCode(courseCode);
            existing.setTitle(title);
            existing.setShortDescription(shortDescription);
            existing.setDescription(description);
            existing.setCategory(category);
            existing.setTrainerName(trainerName);
            existing.setDurationHours(durationHours);
            existing.setPrice(price);
            existing.setPublished(published);
            existing.setTestLink(testLink);
            existing.setTestDescription(testDescription);

            try {
                // Handle legacy image
                if (removeImage) {
                    existing.setImage(null);
                    existing.setImageContentType(null);
                } else if (image != null && !image.isEmpty()) {
                    existing.setImage(image.getBytes());
                    existing.setImageContentType(image.getContentType());
                }

                // Handle thumbnail image
                if (removeThumbnailImage) {
                    existing.setThumbnailImage(null);
                    existing.setThumbnailImageContentType(null);
                } else if (thumbnailImage != null && !thumbnailImage.isEmpty()) {
                    existing.setThumbnailImage(thumbnailImage.getBytes());
                    existing.setThumbnailImageContentType(thumbnailImage.getContentType());
                }

                // Handle description image
                if (removeDescriptionImage) {
                    existing.setDescriptionImage(null);
                    existing.setDescriptionImageContentType(null);
                } else if (descriptionImage != null && !descriptionImage.isEmpty()) {
                    existing.setDescriptionImage(descriptionImage.getBytes());
                    existing.setDescriptionImageContentType(descriptionImage.getContentType());
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to process image", e);
            }

            Course saved = repo.save(existing);
            return ResponseEntity.ok(CourseDto.fromEntity(saved));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Update a course (JSON)")
    public ResponseEntity<CourseDto> updateJson(@PathVariable("id") Long id, @RequestBody Course c) {
        return repo.findById(id).map(existing -> {
            existing.setTitle(c.getTitle());
            existing.setDescription(c.getDescription());
            existing.setCategory(c.getCategory());
            existing.setDurationHours(c.getDurationHours());
            existing.setPrice(c.getPrice());
            existing.setPublished(c.getPublished());
            existing.setTestLink(c.getTestLink());
            existing.setTestDescription(c.getTestDescription());
            Course saved = repo.save(existing);
            return ResponseEntity.ok(CourseDto.fromEntity(saved));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/thumbnail")
    @Operation(summary = "Get course thumbnail image")
    public ResponseEntity<byte[]> getThumbnailImage(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            // Check thumbnail first, fall back to legacy image
            byte[] imageData = course.getThumbnailImage();
            String contentType = course.getThumbnailImageContentType();

            if (imageData == null || imageData.length == 0) {
                imageData = course.getImage();
                contentType = course.getImageContentType();
            }

            if (imageData == null || imageData.length == 0) {
                return ResponseEntity.notFound().<byte[]>build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType != null ? contentType : "image/jpeg"));
            headers.setContentLength(imageData.length);

            return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/description-image")
    @Operation(summary = "Get course description image")
    public ResponseEntity<byte[]> getDescriptionImage(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            if (course.getDescriptionImage() == null || course.getDescriptionImage().length == 0) {
                return ResponseEntity.notFound().<byte[]>build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    course.getDescriptionImageContentType() != null ? course.getDescriptionImageContentType() : "image/jpeg"
            ));
            headers.setContentLength(course.getDescriptionImage().length);

            return new ResponseEntity<>(course.getDescriptionImage(), headers, HttpStatus.OK);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/thumbnail")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Delete course thumbnail image")
    public ResponseEntity<?> deleteThumbnailImage(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            course.setThumbnailImage(null);
            course.setThumbnailImageContentType(null);
            repo.save(course);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/description-image")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Delete course description image")
    public ResponseEntity<?> deleteDescriptionImage(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            course.setDescriptionImage(null);
            course.setDescriptionImageContentType(null);
            repo.save(course);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/image")
    @Operation(summary = "Get course image")
    public ResponseEntity<byte[]> getImage(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            if (course.getImage() == null || course.getImage().length == 0) {
                return ResponseEntity.notFound().<byte[]>build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    course.getImageContentType() != null ? course.getImageContentType() : "image/jpeg"
            ));
            headers.setContentLength(course.getImage().length);

            return new ResponseEntity<>(course.getImage(), headers, HttpStatus.OK);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Delete course image")
    public ResponseEntity<?> deleteImage(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            course.setImage(null);
            course.setImageContentType(null);
            repo.save(course);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a course and all associated data")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Course deleted"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    @Transactional
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            // 1. Delete video progress for all videos in this course
            List<Video> videos = videoRepo.findByCourseOrderByOrderIndex(course);
            for (Video video : videos) {
                videoProgressRepo.deleteByVideo(video);
            }

            // 2. Delete all videos for this course
            videoRepo.deleteByCourse(course);

            // 3. Delete all certificates for this course
            certificateRepo.deleteByCourse(course);

            // 4. Delete all enrollments for this course
            enrollmentRepo.deleteByCourse(course);

            // 5. Finally delete the course
            repo.delete(course);

            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/videos")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Add a video to a course")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Video created"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<Video> addVideo(@PathVariable("id") Long id, @RequestBody Video v) {
        Course course = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Course not found"));
        v.setId(null);
        v.setCourse(course);
        Video saved = videoRepo.save(v);
        return ResponseEntity.created(URI.create("/api/courses/" + id + "/videos/" + saved.getId())).body(saved);
    }

    @GetMapping("/{id}/videos/admin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "List all videos for a course (admin)")
    @ApiResponse(responseCode = "200", description = "List of videos")
    public ResponseEntity<List<Video>> listVideosAdmin(@PathVariable("id") Long id) {
        Course course = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Course not found"));
        return ResponseEntity.ok(videoRepo.findByCourseOrderByOrderIndex(course));
    }

    @PutMapping("/{courseId}/videos/{videoId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Update a video")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Video updated"),
            @ApiResponse(responseCode = "404", description = "Video not found")
    })
    public ResponseEntity<Video> updateVideo(
            @PathVariable("courseId") Long courseId,
            @PathVariable("videoId") Long videoId,
            @RequestBody Video v
    ) {
        return videoRepo.findById(videoId).map(existing -> {
            existing.setTitle(v.getTitle());
            existing.setUrl(v.getUrl());
            existing.setOrderIndex(v.getOrderIndex());
            existing.setDurationSeconds(v.getDurationSeconds());
            Video saved = videoRepo.save(existing);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{courseId}/videos/{videoId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Delete a video from a course")
    @ApiResponse(responseCode = "204", description = "Video deleted")
    public ResponseEntity<?> deleteVideo(
            @PathVariable("courseId") Long courseId,
            @PathVariable("videoId") Long videoId
    ) {
        if (videoRepo.existsById(videoId)) {
            videoRepo.deleteById(videoId);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Publish a course")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Course published"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<CourseDto> publishCourse(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            course.setPublished(true);
            Course saved = repo.save(course);
            return ResponseEntity.ok(CourseDto.fromEntity(saved));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Unpublish a course")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Course unpublished"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<CourseDto> unpublishCourse(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            course.setPublished(false);
            Course saved = repo.save(course);
            return ResponseEntity.ok(CourseDto.fromEntity(saved));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
