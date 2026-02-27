package com.uyirgene.course;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandardDto {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String fileName;
    private String fileContentType;
    private Long fileSize;
    private boolean hasFile;
    private Integer displayOrder;
    private LocalDateTime createdAt;

    public static StandardDto fromEntity(Standard s) {
        boolean hasFile = s.getFileData() != null && s.getFileData().length > 0;
        return StandardDto.builder()
                .id(s.getId())
                .title(s.getTitle())
                .description(s.getDescription())
                .category(s.getCategory())
                .fileName(s.getFileName())
                .fileContentType(s.getFileContentType())
                .fileSize(s.getFileSize())
                .hasFile(hasFile)
                .displayOrder(s.getDisplayOrder())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
