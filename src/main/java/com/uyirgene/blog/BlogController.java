package com.uyirgene.blog;

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
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogRepository repo;

    @GetMapping
    @Operation(summary = "List blogs")
    @ApiResponse(responseCode = "200", description = "List of blogs")
    public ResponseEntity<List<Blog>> all() {
        return ResponseEntity.ok(repo.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('AUTHOR')")
    @Operation(summary = "Create blog post")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Created"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<Blog> create(@RequestBody Blog b) {
        b.setId(null);
        Blog saved = repo.save(b);
        return ResponseEntity.created(URI.create("/api/blogs/" + saved.getId())).body(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete blog post")
    @ApiResponse(responseCode = "204", description = "Deleted")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AUTHOR')")
    @Operation(summary = "Update blog post")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Updated"),
            @ApiResponse(responseCode = "404", description = "Not found")
    })
    public ResponseEntity<Blog> update(@PathVariable Long id, @RequestBody Blog b) {
        return repo.findById(id).map(existing -> {
            existing.setTitle(b.getTitle());
            existing.setContent(b.getContent());
            existing.setCategory(b.getCategory());
            existing.setImageUrl(b.getImageUrl());
            return ResponseEntity.ok(repo.save(existing));
        }).orElseGet(() -> {
            b.setId(null);
            Blog saved = repo.save(b);
            return ResponseEntity.created(URI.create("/api/blogs/" + saved.getId())).body(saved);
        });
    }
} 
