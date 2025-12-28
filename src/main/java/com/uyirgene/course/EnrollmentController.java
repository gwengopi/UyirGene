package com.uyirgene.course;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    @PostMapping("/{id}/enroll")
    @Operation(summary = "Enroll current user in a course")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Enrolled"),
            @ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<Enrollment> enroll(@PathVariable Long id) {
        Enrollment e = enrollmentService.enroll(id);
        return ResponseEntity.created(URI.create("/api/courses/" + id + "/enroll")).body(e);
    }
}