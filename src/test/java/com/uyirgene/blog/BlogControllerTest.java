package com.uyirgene.blog;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;

public class BlogControllerTest {

    @Test
    void list_returns_all_published_blogs() {
        BlogService blogService = Mockito.mock(BlogService.class);
        BlogController controller = new BlogController(blogService);
        assertThat(controller.getAllPublishedBlogs()).isNotNull();
    }
}
