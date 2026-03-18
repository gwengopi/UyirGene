package com.uyirgene.course;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uyirgene.course.dto.CourseDto;
import com.uyirgene.util.FileStorageService;
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
import java.io.InputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    private final ObjectMapper objectMapper;
    private final FileStorageService fileStorageService;

    private static final String IMAGE_SUBDIR = "course-images";

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "List all courses including unpublished (admin)")
    @ApiResponse(responseCode = "200", description = "List of all courses")
    @Transactional(readOnly = true)
    public ResponseEntity<List<CourseDto>> adminAll() {
        List<CourseDto> courses = repo.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .map(CourseDto::fromEntity)
                .toList();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/flagship")
    @Operation(summary = "List flagship courses")
    @ApiResponse(responseCode = "200", description = "List of flagship courses")
    @Transactional(readOnly = true)
    public ResponseEntity<List<CourseDto>> flagship() {
        List<CourseDto> courses = repo.findByFlagshipTrueAndPublishedTrueOrderByDisplayOrderAscIdAsc().stream()
                .map(CourseDto::fromEntity)
                .toList();
        return ResponseEntity.ok(courses);
    }

    @GetMapping
    @Operation(summary = "List all published courses with optional filtering and sorting")
    @ApiResponse(responseCode = "200", description = "List of published courses")
    @Transactional(readOnly = true)
    public ResponseEntity<List<CourseDto>> all(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "excludeCategory", defaultValue = "false") boolean excludeCategory,
            @RequestParam(value = "sortBy", required = false) String sortBy,
            @RequestParam(value = "sortOrder", defaultValue = "asc") String sortOrder
    ) {
        List<Course> courses;
        if (category != null && !category.isBlank()) {
            courses = excludeCategory
                    ? repo.findByPublishedTrueAndCategoryNotOrderByDisplayOrderAscIdAsc(category)
                    : repo.findByPublishedTrueAndCategoryOrderByDisplayOrderAscIdAsc(category);
            List<CourseDto> dtos = courses.stream().map(CourseDto::fromEntity).toList();
            return ResponseEntity.ok(dtos);
        }
        courses = new java.util.ArrayList<>(repo.findByPublishedTrueOrderByDisplayOrderAscIdAsc());

        // Apply sorting (overrides default display order when explicitly requested)
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
    @Transactional
    @Operation(summary = "Create a course with optional images")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Course created"),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<?> create(
            @RequestParam(value = "courseCode", required = false) String courseCode,
            @RequestParam("title") String title,
            @RequestParam(value = "tagline", required = false) String tagline,
            @RequestParam(value = "shortDescription", required = false) String shortDescription,
            @RequestParam("description") String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "durationHours", required = false) Integer durationHours,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "published", defaultValue = "false") Boolean published,
            @RequestParam(value = "flagship", defaultValue = "false") Boolean flagship,
            @RequestParam(value = "courseType", required = false) String courseType,
            @RequestParam(value = "trainerName", required = false) String trainerName,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage,
            @RequestParam(value = "descriptionImage", required = false) MultipartFile descriptionImage,
            @RequestParam(value = "testLink", required = false) String testLink,
            @RequestParam(value = "testDescription", required = false) String testDescription,
            @RequestParam(value = "assessmentLinks", required = false) String assessmentLinksJson,
            @RequestParam(value = "preAssessmentLinks", required = false) String preAssessmentLinksJson,
            @RequestParam(value = "preAssessmentInstructions", required = false) String preAssessmentInstructions,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "countryPrices", required = false) String countryPricesJson,
            @RequestParam(value = "keyComponents", required = false) String keyComponents,
            @RequestParam(value = "targetAudience", required = false) String targetAudience,
            @RequestParam(value = "assessment", required = false) String assessment,
            @RequestParam(value = "outcome", required = false) String outcome,
            @RequestParam(value = "courseDurationText", required = false) String courseDurationText,
            @RequestParam(value = "examDetails", required = false) String examDetails,
            @RequestParam(value = "reminderDays", required = false) Integer reminderDays
    ) throws IOException {
        // Validate price
        if (price != null && price < 0) {
            return ResponseEntity.badRequest().body(null);
        }

        // Validate uploaded images
        for (MultipartFile img : new MultipartFile[]{image, thumbnailImage, descriptionImage}) {
            String err = validateImage(img);
            if (err != null) return ResponseEntity.badRequest().body(Map.of("message", err));
        }

        Course course = Course.builder()
                .courseCode(courseCode != null && !courseCode.isBlank() ? courseCode : null)
                .title(title)
                .tagline(tagline)
                .shortDescription(shortDescription)
                .description(description)
                .keyComponents(keyComponents)
                .targetAudience(targetAudience)
                .assessment(assessment)
                .outcome(outcome)
                .courseDurationText(courseDurationText)
                .examDetails(examDetails)
                .category(category)
                .durationHours(durationHours)
                .price(price)
                .published(published)
                .flagship(flagship)
                .displayOrder(displayOrder)
                .courseType(courseType)
                .trainerName(trainerName)
                .testLink(testLink)
                .testDescription(testDescription)
                .assessmentLinks(assessmentLinksJson)
                .preAssessmentLinks(preAssessmentLinksJson)
                .preAssessmentInstructions(preAssessmentInstructions)
                .reminderDays(reminderDays)
                .build();

        // Handle legacy image field
        if (image != null && !image.isEmpty()) {
            course.setImagePath(fileStorageService.store(image, IMAGE_SUBDIR));
            course.setImageContentType(image.getContentType());
        }

        // Handle thumbnail image (use dedicated field or fall back to legacy)
        if (thumbnailImage != null && !thumbnailImage.isEmpty()) {
            course.setThumbnailImagePath(fileStorageService.store(thumbnailImage, IMAGE_SUBDIR));
            course.setThumbnailImageContentType(thumbnailImage.getContentType());
        } else if (image != null && !image.isEmpty()) {
            // If only legacy image provided, store a second copy as thumbnail
            course.setThumbnailImagePath(fileStorageService.store(image, IMAGE_SUBDIR));
            course.setThumbnailImageContentType(image.getContentType());
        }

        // Handle description image
        if (descriptionImage != null && !descriptionImage.isEmpty()) {
            course.setDescriptionImagePath(fileStorageService.store(descriptionImage, IMAGE_SUBDIR));
            course.setDescriptionImageContentType(descriptionImage.getContentType());
        }

        // Handle country prices
        parseAndSetCountryPrices(course, countryPricesJson);

        Course saved = repo.save(course);
        return ResponseEntity.created(URI.create("/api/courses/" + saved.getId()))
                .body(CourseDto.fromEntity(saved));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Transactional
    @Operation(summary = "Create a course (JSON)")
    public ResponseEntity<CourseDto> createJson(@RequestBody Course c) {
        if (c.getPrice() != null && c.getPrice() < 0) {
            return ResponseEntity.badRequest().body(null);
        }
        // Only copy safe fields to prevent mass assignment
        Course course = Course.builder()
                .courseCode(c.getCourseCode())
                .title(c.getTitle())
                .tagline(c.getTagline())
                .shortDescription(c.getShortDescription())
                .description(c.getDescription())
                .keyComponents(c.getKeyComponents())
                .targetAudience(c.getTargetAudience())
                .assessment(c.getAssessment())
                .outcome(c.getOutcome())
                .courseDurationText(c.getCourseDurationText())
                .examDetails(c.getExamDetails())
                .category(c.getCategory())
                .durationHours(c.getDurationHours())
                .price(c.getPrice())
                .published(c.getPublished())
                .flagship(c.getFlagship())
                .displayOrder(c.getDisplayOrder())
                .courseType(c.getCourseType())
                .trainerName(c.getTrainerName())
                .testLink(c.getTestLink())
                .testDescription(c.getTestDescription())
                .build();
        Course saved = repo.save(course);
        return ResponseEntity.created(URI.create("/api/courses/" + saved.getId()))
                .body(CourseDto.fromEntity(saved));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single course")
    @Transactional(readOnly = true)
    public ResponseEntity<CourseDto> get(@PathVariable("id") Long id) {
        return repo.findById(id)
                .map(course -> ResponseEntity.ok(CourseDto.fromEntity(course)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Transactional
    @Operation(summary = "Update a course with optional images")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Course updated"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<?> update(
            @PathVariable("id") Long id,
            @RequestParam(value = "courseCode", required = false) String courseCode,
            @RequestParam("title") String title,
            @RequestParam(value = "tagline", required = false) String tagline,
            @RequestParam(value = "shortDescription", required = false) String shortDescription,
            @RequestParam("description") String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "durationHours", required = false) Integer durationHours,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "published", defaultValue = "false") Boolean published,
            @RequestParam(value = "flagship", defaultValue = "false") Boolean flagship,
            @RequestParam(value = "courseType", required = false) String courseType,
            @RequestParam(value = "trainerName", required = false) String trainerName,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage,
            @RequestParam(value = "descriptionImage", required = false) MultipartFile descriptionImage,
            @RequestParam(value = "testLink", required = false) String testLink,
            @RequestParam(value = "testDescription", required = false) String testDescription,
            @RequestParam(value = "assessmentLinks", required = false) String assessmentLinksJson,
            @RequestParam(value = "preAssessmentLinks", required = false) String preAssessmentLinksJson,
            @RequestParam(value = "preAssessmentInstructions", required = false) String preAssessmentInstructions,
            @RequestParam(value = "removeImage", defaultValue = "false") Boolean removeImage,
            @RequestParam(value = "removeThumbnailImage", defaultValue = "false") Boolean removeThumbnailImage,
            @RequestParam(value = "removeDescriptionImage", defaultValue = "false") Boolean removeDescriptionImage,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "countryPrices", required = false) String countryPricesJson,
            @RequestParam(value = "keyComponents", required = false) String keyComponents,
            @RequestParam(value = "targetAudience", required = false) String targetAudience,
            @RequestParam(value = "assessment", required = false) String assessment,
            @RequestParam(value = "outcome", required = false) String outcome,
            @RequestParam(value = "courseDurationText", required = false) String courseDurationText,
            @RequestParam(value = "examDetails", required = false) String examDetails,
            @RequestParam(value = "reminderDays", required = false) Integer reminderDays
    ) throws IOException {
        // Validate uploaded images before hitting the DB
        for (MultipartFile img : new MultipartFile[]{image, thumbnailImage, descriptionImage}) {
            String err = validateImage(img);
            if (err != null) return ResponseEntity.badRequest().body(Map.of("message", err));
        }
        return repo.findById(id).map(existing -> {
            existing.setCourseCode(courseCode != null && !courseCode.isBlank() ? courseCode : null);
            existing.setTitle(title);
            existing.setTagline(tagline);
            existing.setShortDescription(shortDescription);
            existing.setDescription(description);
            existing.setKeyComponents(keyComponents);
            existing.setTargetAudience(targetAudience);
            existing.setAssessment(assessment);
            existing.setOutcome(outcome);
            existing.setCourseDurationText(courseDurationText);
            existing.setExamDetails(examDetails);
            existing.setCategory(category);
            existing.setTrainerName(trainerName);
            existing.setDurationHours(durationHours);
            existing.setPrice(price);
            existing.setPublished(published);
            existing.setFlagship(flagship);
            existing.setDisplayOrder(displayOrder);
            existing.setCourseType(courseType);
            existing.setTestLink(testLink);
            existing.setTestDescription(testDescription);
            existing.setAssessmentLinks(assessmentLinksJson);
            existing.setPreAssessmentLinks(preAssessmentLinksJson);
            existing.setPreAssessmentInstructions(preAssessmentInstructions);
            existing.setReminderDays(reminderDays);

            try {
                // Handle legacy image
                if (removeImage) {
                    fileStorageService.delete(existing.getImagePath(), IMAGE_SUBDIR);
                    existing.setImagePath(null);
                    existing.setImageContentType(null);
                } else if (image != null && !image.isEmpty()) {
                    fileStorageService.delete(existing.getImagePath(), IMAGE_SUBDIR);
                    existing.setImagePath(fileStorageService.store(image, IMAGE_SUBDIR));
                    existing.setImageContentType(image.getContentType());
                }

                // Handle thumbnail image
                if (removeThumbnailImage) {
                    fileStorageService.delete(existing.getThumbnailImagePath(), IMAGE_SUBDIR);
                    existing.setThumbnailImagePath(null);
                    existing.setThumbnailImageContentType(null);
                } else if (thumbnailImage != null && !thumbnailImage.isEmpty()) {
                    fileStorageService.delete(existing.getThumbnailImagePath(), IMAGE_SUBDIR);
                    existing.setThumbnailImagePath(fileStorageService.store(thumbnailImage, IMAGE_SUBDIR));
                    existing.setThumbnailImageContentType(thumbnailImage.getContentType());
                }

                // Handle description image
                if (removeDescriptionImage) {
                    fileStorageService.delete(existing.getDescriptionImagePath(), IMAGE_SUBDIR);
                    existing.setDescriptionImagePath(null);
                    existing.setDescriptionImageContentType(null);
                } else if (descriptionImage != null && !descriptionImage.isEmpty()) {
                    fileStorageService.delete(existing.getDescriptionImagePath(), IMAGE_SUBDIR);
                    existing.setDescriptionImagePath(fileStorageService.store(descriptionImage, IMAGE_SUBDIR));
                    existing.setDescriptionImageContentType(descriptionImage.getContentType());
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to process image", e);
            }

            // Handle country prices
            parseAndSetCountryPrices(existing, countryPricesJson);

            Course saved = repo.save(existing);
            return ResponseEntity.ok(CourseDto.fromEntity(saved));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Transactional
    @Operation(summary = "Update a course (JSON)")
    public ResponseEntity<CourseDto> updateJson(@PathVariable("id") Long id, @RequestBody Course c) {
        if (c.getPrice() != null && c.getPrice() < 0) {
            return ResponseEntity.badRequest().body(null);
        }
        return repo.findById(id).map(existing -> {
            existing.setTitle(c.getTitle());
            existing.setTagline(c.getTagline());
            existing.setDescription(c.getDescription());
            existing.setKeyComponents(c.getKeyComponents());
            existing.setTargetAudience(c.getTargetAudience());
            existing.setAssessment(c.getAssessment());
            existing.setOutcome(c.getOutcome());
            existing.setCourseDurationText(c.getCourseDurationText());
            existing.setExamDetails(c.getExamDetails());
            existing.setCategory(c.getCategory());
            existing.setDurationHours(c.getDurationHours());
            existing.setPrice(c.getPrice());
            existing.setPublished(c.getPublished());
            existing.setDisplayOrder(c.getDisplayOrder());
            existing.setCourseType(c.getCourseType());
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
            try {
                // Check thumbnailImagePath first, fall back to legacy imagePath
                String path = course.getThumbnailImagePath() != null
                        ? course.getThumbnailImagePath()
                        : course.getImagePath();
                String contentType = course.getThumbnailImagePath() != null
                        ? course.getThumbnailImageContentType()
                        : course.getImageContentType();

                byte[] imageData = fileStorageService.load(path, IMAGE_SUBDIR);
                if (imageData == null) return ResponseEntity.notFound().<byte[]>build();

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(contentType != null ? contentType : "image/jpeg"));
                headers.setContentLength(imageData.length);
                headers.setCacheControl("public, max-age=3600");
                return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
            } catch (IOException e) {
                return ResponseEntity.notFound().<byte[]>build();
            }
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/description-image")
    @Operation(summary = "Get course description image")
    public ResponseEntity<byte[]> getDescriptionImage(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            try {
                byte[] imageData = fileStorageService.load(course.getDescriptionImagePath(), IMAGE_SUBDIR);
                if (imageData == null) return ResponseEntity.notFound().<byte[]>build();

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(
                        course.getDescriptionImageContentType() != null ? course.getDescriptionImageContentType() : "image/jpeg"
                ));
                headers.setContentLength(imageData.length);
                headers.setCacheControl("public, max-age=3600");
                return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
            } catch (IOException e) {
                return ResponseEntity.notFound().<byte[]>build();
            }
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/thumbnail")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Delete course thumbnail image")
    public ResponseEntity<?> deleteThumbnailImage(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            fileStorageService.delete(course.getThumbnailImagePath(), IMAGE_SUBDIR);
            course.setThumbnailImagePath(null);
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
            fileStorageService.delete(course.getDescriptionImagePath(), IMAGE_SUBDIR);
            course.setDescriptionImagePath(null);
            course.setDescriptionImageContentType(null);
            repo.save(course);
            return ResponseEntity.noContent().build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/image")
    @Operation(summary = "Get course image (legacy)")
    public ResponseEntity<byte[]> getImage(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            try {
                byte[] imageData = fileStorageService.load(course.getImagePath(), IMAGE_SUBDIR);
                if (imageData == null) return ResponseEntity.notFound().<byte[]>build();

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(
                        course.getImageContentType() != null ? course.getImageContentType() : "image/jpeg"
                ));
                headers.setContentLength(imageData.length);
                headers.setCacheControl("public, max-age=3600");
                return new ResponseEntity<>(imageData, headers, HttpStatus.OK);
            } catch (IOException e) {
                return ResponseEntity.notFound().<byte[]>build();
            }
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/image")
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Delete course image (legacy)")
    public ResponseEntity<?> deleteImage(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            fileStorageService.delete(course.getImagePath(), IMAGE_SUBDIR);
            course.setImagePath(null);
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

            // 5. Delete image files from filesystem
            fileStorageService.delete(course.getThumbnailImagePath(), IMAGE_SUBDIR);
            fileStorageService.delete(course.getDescriptionImagePath(), IMAGE_SUBDIR);
            fileStorageService.delete(course.getImagePath(), IMAGE_SUBDIR);

            // 6. Finally delete the course
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
        // Only copy safe fields to prevent over-posting
        Video video = new Video();
        video.setCourse(course);
        video.setTitle(v.getTitle());
        video.setUrl(v.getUrl());
        video.setOrderIndex(v.getOrderIndex());
        video.setDurationSeconds(v.getDurationSeconds());
        Video saved = videoRepo.save(video);
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
    @Transactional
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
    @Transactional
    public ResponseEntity<CourseDto> unpublishCourse(@PathVariable("id") Long id) {
        return repo.findById(id).map(course -> {
            course.setPublished(false);
            Course saved = repo.save(course);
            return ResponseEntity.ok(CourseDto.fromEntity(saved));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp");

    /**
     * Parse country prices JSON and set on course entity.
     * Uses in-place merge to avoid Hibernate orphanRemoval + unique constraint conflicts.
     */
    private void parseAndSetCountryPrices(Course course, String countryPricesJson) {
        // null means the field wasn't sent - don't modify existing prices
        if (countryPricesJson == null) {
            return;
        }
        // Blank or empty means explicitly clear all prices
        if (countryPricesJson.isBlank()) {
            course.getCountryPrices().clear();
            return;
        }
        try {
            List<Map<String, Object>> pricesList = objectMapper.readValue(
                    countryPricesJson, new TypeReference<>() {});

            if (pricesList.isEmpty()) {
                course.getCountryPrices().clear();
                return;
            }

            // Build map of incoming prices keyed by country code
            Map<String, Map<String, Object>> newPricesMap = new HashMap<>();
            for (Map<String, Object> entry : pricesList) {
                String cc = (String) entry.get("countryCode");
                if (cc != null) newPricesMap.put(cc, entry);
            }

            // Update existing entries in-place or mark for removal
            List<CoursePrice> toRemove = new ArrayList<>();
            for (CoursePrice cp : course.getCountryPrices()) {
                Map<String, Object> newEntry = newPricesMap.remove(cp.getCountryCode());
                if (newEntry != null) {
                    // Update existing row (no INSERT/DELETE needed)
                    cp.setCurrencyCode((String) newEntry.get("currencyCode"));
                    Object amtObj = newEntry.get("amount");
                    cp.setAmount(amtObj instanceof Number
                            ? ((Number) amtObj).doubleValue()
                            : Double.parseDouble(amtObj.toString()));
                } else {
                    toRemove.add(cp);
                }
            }
            course.getCountryPrices().removeAll(toRemove);

            // Add genuinely new country entries
            for (Map<String, Object> entry : newPricesMap.values()) {
                String countryCode = (String) entry.get("countryCode");
                String currencyCode = (String) entry.get("currencyCode");
                Object amtObj = entry.get("amount");
                Double amount = amtObj instanceof Number
                        ? ((Number) amtObj).doubleValue()
                        : Double.parseDouble(amtObj.toString());
                if (countryCode != null && currencyCode != null && amount > 0) {
                    CoursePrice cp = CoursePrice.builder()
                            .course(course)
                            .countryCode(countryCode)
                            .currencyCode(currencyCode)
                            .amount(amount)
                            .build();
                    course.getCountryPrices().add(cp);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid countryPrices JSON", e);
        }
    }

    /**
     * Validate image file: check content type and magic bytes
     */
    private String validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) return null;
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            return "Invalid image type. Allowed: JPEG, PNG, GIF, WebP";
        }
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[4];
            if (is.read(header) < 4) return "File too small to be a valid image";
            // JPEG: FF D8 FF, PNG: 89 50 4E 47, GIF: 47 49 46, WebP: starts with RIFF
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
}
