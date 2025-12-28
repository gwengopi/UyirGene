package com.uyirgene.course;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<List<Course>> all() {
        return ResponseEntity.ok(repo.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR')")
    @Operation(summary = "Create a course")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Course created"),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<Course> create(@RequestBody Course c) {
        c.setId(null);
        Course saved = repo.save(c);
        return ResponseEntity.created(URI.create("/api/courses/" + saved.getId())).body(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a course")
    @ApiResponse(responseCode = "204", description = "Course deleted")
    public ResponseEntity<?> delete(@PathVariable Long id) {
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
    public ResponseEntity<Video> addVideo(@PathVariable Long id, @RequestBody Video v) {
        Course course = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Course not found"));
        v.setId(null);
        v.setCourse(course);
        Video saved = videoRepo.save(v);
        return ResponseEntity.created(URI.create("/api/courses/" + id + "/videos/" + saved.getId())).body(saved);
    }
}
 
