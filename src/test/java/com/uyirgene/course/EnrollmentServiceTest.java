package com.uyirgene.course;

import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

public class EnrollmentServiceTest {

    @Test
    void enroll_saves_enrollment_if_not_exists() {
        EnrollmentRepository enrollmentRepo = Mockito.mock(EnrollmentRepository.class);
        CourseRepository courseRepo = Mockito.mock(CourseRepository.class);
        CurrentUserService currentUserService = Mockito.mock(CurrentUserService.class);
        com.uyirgene.course.payment.PaymentProvider paymentProvider = Mockito.mock(com.uyirgene.course.payment.PaymentProvider.class);
        com.uyirgene.course.MailService mailService = Mockito.mock(com.uyirgene.course.MailService.class);

        User u = User.builder().id(1L).email("a@b").name("A").build();
        Course c = Course.builder().id(2L).title("C").build();

        Mockito.when(currentUserService.getCurrentUser()).thenReturn(u);
        Mockito.when(courseRepo.findById(2L)).thenReturn(Optional.of(c));
        Mockito.when(enrollmentRepo.findByUserAndCourse(u, c)).thenReturn(Optional.empty());
        Mockito.when(enrollmentRepo.save(Mockito.any())).thenAnswer(i -> i.getArgument(0));

        EnrollmentService s = new EnrollmentService(enrollmentRepo, courseRepo, currentUserService, paymentProvider, mailService);
        Enrollment e = s.enroll(2L);

        assertThat(e.getUser()).isEqualTo(u);
        assertThat(e.getCourse()).isEqualTo(c);
        assertThat(e.getStatus()).isEqualTo(Enrollment.Status.ENROLLED);
    }
}
