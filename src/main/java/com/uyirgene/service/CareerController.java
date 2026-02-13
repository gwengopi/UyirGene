package com.uyirgene.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/careers")
@RequiredArgsConstructor
public class CareerController {
    private final CareerService service;
    private static final ObjectMapper objectMapper = new ObjectMapper();

    // ==================== Public Endpoints ====================

    @GetMapping
    @Operation(summary = "List all published careers")
    @ApiResponse(responseCode = "200", description = "List of published careers")
    public ResponseEntity<List<CareerDto>> listPublished() {
        return ResponseEntity.ok(service.getAllPublished());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a career by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Career found"),
            @ApiResponse(responseCode = "404", description = "Career not found")
    })
    public ResponseEntity<CareerDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // ==================== Admin Endpoints ====================

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all careers (admin)")
    public ResponseEntity<List<CareerDto>> listAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new career entry")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Career created"),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<CareerDto> create(
            @RequestParam("title") String title,
            @RequestParam(value = "subtitle", required = false) String subtitle,
            @RequestParam(value = "whyJoinTitle", required = false) String whyJoinTitle,
            @RequestParam(value = "whyJoinDescription", required = false) String whyJoinDescription,
            @RequestParam(value = "benefits", required = false) String benefitsJson,
            @RequestParam(value = "positions", required = false) String positionsJson,
            @RequestParam(value = "published", defaultValue = "false") Boolean published,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder
    ) {
        List<String> benefits = parseStringList(benefitsJson);
        List<CareerDto.Position> positions = parsePositionList(positionsJson);

        CareerDto created = service.create(
                title, subtitle, whyJoinTitle, whyJoinDescription,
                benefits, positions,
                published, displayOrder
        );

        return ResponseEntity.created(URI.create("/api/careers/" + created.getId()))
                .body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a career entry")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Career updated"),
            @ApiResponse(responseCode = "404", description = "Career not found")
    })
    public ResponseEntity<CareerDto> update(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "subtitle", required = false) String subtitle,
            @RequestParam(value = "whyJoinTitle", required = false) String whyJoinTitle,
            @RequestParam(value = "whyJoinDescription", required = false) String whyJoinDescription,
            @RequestParam(value = "benefits", required = false) String benefitsJson,
            @RequestParam(value = "positions", required = false) String positionsJson,
            @RequestParam(value = "published", defaultValue = "false") Boolean published,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder
    ) {
        List<String> benefits = parseStringList(benefitsJson);
        List<CareerDto.Position> positions = parsePositionList(positionsJson);

        CareerDto updated = service.update(
                id, title, subtitle, whyJoinTitle, whyJoinDescription,
                benefits, positions,
                published, displayOrder
        );

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a career entry")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Career deleted"),
            @ApiResponse(responseCode = "404", description = "Career not found")
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Helper Methods ====================

    private List<String> parseStringList(String json) {
        if (json == null || json.isEmpty()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return null;
        }
    }

    private List<CareerDto.Position> parsePositionList(String json) {
        if (json == null || json.isEmpty()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<List<CareerDto.Position>>() {});
        } catch (Exception e) {
            return null;
        }
    }
}
