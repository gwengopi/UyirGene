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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseRepository repo;
    private final VideoRepository videoRepo;

    @GetMapping
    @Operation(summary = "List all courses")
    @ApiResponse(responseCode = "200", description = "List of courses")
    public ResponseEntity<List<CourseDto>> all() {
        List<CourseDto> courses = repo.findAll().stream()
                .map(CourseDto::fromEntity)
                .toList();
        return ResponseEntity.ok(courses);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Create a course with optional image")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Course created"),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<CourseDto> create(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "durationHours", required = false) Integer durationHours,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "published", defaultValue = "false") Boolean published,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) throws IOException {
        Course course = Course.builder()
                .title(title)
                .description(description)
                .category(category)
                .durationHours(durationHours)
                .price(price)
                .published(published)
                .build();

        if (image != null && !image.isEmpty()) {
            course.setImage(image.getBytes());
            course.setImageContentType(image.getContentType());
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
    @Operation(summary = "Update a course with optional image")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Course updated"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<CourseDto> update(
            @PathVariable("id") Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "durationHours", required = false) Integer durationHours,
            @RequestParam(value = "price", required = false) Double price,
            @RequestParam(value = "published", defaultValue = "false") Boolean published,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "removeImage", defaultValue = "false") Boolean removeImage
    ) throws IOException {
        return repo.findById(id).map(existing -> {
            existing.setTitle(title);
            existing.setDescription(description);
            existing.setCategory(category);
            existing.setDurationHours(durationHours);
            existing.setPrice(price);
            existing.setPublished(published);

            try {
                if (removeImage) {
                    existing.setImage(null);
                    existing.setImageContentType(null);
                } else if (image != null && !image.isEmpty()) {
                    existing.setImage(image.getBytes());
                    existing.setImageContentType(image.getContentType());
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
            Course saved = repo.save(existing);
            return ResponseEntity.ok(CourseDto.fromEntity(saved));
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
    @Operation(summary = "Delete a course")
    @ApiResponse(responseCode = "204", description = "Course deleted")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
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
}
