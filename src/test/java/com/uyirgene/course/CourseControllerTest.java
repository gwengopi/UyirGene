package com.uyirgene.course;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.uyirgene.util.FileStorageService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

public class CourseControllerTest {

    @Test
    void list_returns_all_courses() {
        CourseRepository repo = Mockito.mock(CourseRepository.class);
        VideoRepository videoRepo = Mockito.mock(VideoRepository.class);
        EnrollmentRepository enrollmentRepo = Mockito.mock(EnrollmentRepository.class);
        CertificateRepository certificateRepo = Mockito.mock(CertificateRepository.class);
        VideoProgressRepository videoProgressRepo = Mockito.mock(VideoProgressRepository.class);
        ObjectMapper objectMapper = new ObjectMapper();
        FileStorageService fileStorageService = Mockito.mock(FileStorageService.class);

        when(repo.findByPublishedTrueOrderByDisplayOrderAscIdAsc()).thenReturn(List.of());

        CourseController controller = new CourseController(
                repo, videoRepo, enrollmentRepo, certificateRepo,
                videoProgressRepo, objectMapper, fileStorageService);

        // category=null, excludeCategory=false, sortBy=null, sortOrder="asc"
        assertThat(controller.all(null, false, null, "asc")).isNotNull();
    }
}