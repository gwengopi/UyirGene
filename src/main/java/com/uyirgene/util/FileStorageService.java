package com.uyirgene.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path storageRoot;

    public FileStorageService(@Value("${app.storage.root:uploads}") String storageRoot) {
        this.storageRoot = Paths.get(storageRoot).toAbsolutePath().normalize();
    }

    /**
     * Stores a file under <storageRoot>/<subdir>/<uuid><ext> and returns the filename.
     */
    public String store(MultipartFile file, String subdir) throws IOException {
        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf('.'))
                : "";
        String filename = UUID.randomUUID() + ext;
        Path dir = storageRoot.resolve(subdir);
        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), dir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        return filename;
    }

    /**
     * Returns file bytes, or null if filename is null or the file does not exist.
     */
    public byte[] load(String filename, String subdir) throws IOException {
        if (filename == null) return null;
        Path path = storageRoot.resolve(subdir).resolve(filename);
        if (!Files.exists(path)) return null;
        return Files.readAllBytes(path);
    }

    /**
     * Deletes a file. Silently ignores missing or null filenames.
     */
    public void delete(String filename, String subdir) {
        if (filename == null) return;
        try {
            Files.deleteIfExists(storageRoot.resolve(subdir).resolve(filename));
        } catch (IOException ignored) {}
    }
}
