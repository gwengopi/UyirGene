package com.uyirgene.course;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;

import static org.assertj.core.api.Assertions.assertThat;

public class CourseControllerTest {

    @Test
    void list_returns_all_courses() {
        CourseRepository repo = Mockito.mock(CourseRepository.class);
        CourseController controller = new CourseController(repo);
        assertThat(controller.all()).isNotNull();
    }
}
