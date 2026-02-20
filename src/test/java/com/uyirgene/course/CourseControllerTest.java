package com.uyirgene.course;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;

public class CourseControllerTest {

    @Test
    void list_returns_all_courses() {
        CourseRepository repo = Mockito.mock(CourseRepository.class);
        VideoRepository videoRepo = Mockito.mock(VideoRepository.class);
        EnrollmentRepository enrollmentRepo = Mockito.mock(EnrollmentRepository.class);
        CertificateRepository certificateRepo = Mockito.mock(CertificateRepository.class);
        VideoProgressRepository videoProgressRepo = Mockito.mock(VideoProgressRepository.class);
        ObjectMapper objectMapper = new ObjectMapper();
        CourseController controller = new CourseController(repo, videoRepo, enrollmentRepo, certificateRepo, videoProgressRepo, objectMapper);
        assertThat(controller.all(null, "asc")).isNotNull();
    }
}
