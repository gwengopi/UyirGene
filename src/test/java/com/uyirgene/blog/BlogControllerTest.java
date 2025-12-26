package com.uyirgene.blog;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;

public class BlogControllerTest {

    @Test
    void list_returns_all_blogs() {
        BlogRepository repo = Mockito.mock(BlogRepository.class);
        BlogController controller = new BlogController(repo);
        assertThat(controller.all()).isNotNull();
    }
}
