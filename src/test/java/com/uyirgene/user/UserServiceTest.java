package com.uyirgene.user;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;

public class UserServiceTest {

    @Test
    void register_creates_user() {
        UserRepository repo = Mockito.mock(UserRepository.class);
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        UserService service = new UserService(repo, encoder);
        Mockito.when(repo.save(Mockito.any())).thenAnswer(i -> i.getArgument(0));

        User u = service.register("John","john@test.com","pass", Role.STUDENT);

        assertThat(u.getId()).isNull();
        assertThat(encoder.matches("pass", u.getPassword())).isTrue();
    }
}
