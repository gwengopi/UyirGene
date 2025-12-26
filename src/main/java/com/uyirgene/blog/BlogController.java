package com.uyirgene.blog;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogRepository repo;

    @GetMapping
    public List<Blog> all() {
        return repo.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('AUTHOR')")
    public Blog create(@RequestBody Blog b) {
        b.setId(null);
        return repo.save(b);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AUTHOR')")
    public Blog update(@PathVariable Long id, @RequestBody Blog b) {
        return repo.findById(id).map(existing -> {
            existing.setTitle(b.getTitle());
            existing.setContent(b.getContent());
            existing.setCategory(b.getCategory());
            existing.setImageUrl(b.getImageUrl());
            return repo.save(existing);
        }).orElseGet(() -> {
            b.setId(null);
            return repo.save(b);
        });
    }
}
