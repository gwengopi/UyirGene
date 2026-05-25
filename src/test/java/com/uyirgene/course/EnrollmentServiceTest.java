package com.uyirgene.course;

import com.uyirgene.config.SiteConfigService;
import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

public class EnrollmentServiceTest {

    @Test
    void enroll_saves_enrollment_if_not_exists() {
        EnrollmentRepository enrollmentRepo = Mockito.mock(EnrollmentRepository.class);
        CourseRepository courseRepo = Mockito.mock(CourseRepository.class);
        CoursePriceRepository coursePriceRepo = Mockito.mock(CoursePriceRepository.class);
        FlagshipProgramRepository flagshipProgramRepo = Mockito.mock(FlagshipProgramRepository.class); // added
        FlagshipProgramPriceRepository flagshipPriceRepo = Mockito.mock(FlagshipProgramPriceRepository.class); // added
        CurrentUserService currentUserService = Mockito.mock(CurrentUserService.class);
        com.uyirgene.course.payment.PaymentProvider paymentProvider = Mockito.mock(com.uyirgene.course.payment.PaymentProvider.class);
        com.uyirgene.course.MailService mailService = Mockito.mock(com.uyirgene.course.MailService.class);
        SiteConfigService siteConfigService = Mockito.mock(SiteConfigService.class);

        User u = User.builder().id(1L).email("a@b").name("A").build();
        Course c = Course.builder().id(2L).title("C").build();

        Mockito.when(currentUserService.getCurrentUser()).thenReturn(u);
        Mockito.when(courseRepo.findById(2L)).thenReturn(Optional.of(c));
        Mockito.when(enrollmentRepo.findByUserAndCourse(u, c)).thenReturn(Optional.empty());
        Mockito.when(enrollmentRepo.save(Mockito.any())).thenAnswer(i -> i.getArgument(0));

        // correct constructor order matches EnrollmentService field declaration order
        EnrollmentService s = new EnrollmentService(
                enrollmentRepo, courseRepo, coursePriceRepo,
                flagshipProgramRepo, flagshipPriceRepo,   // inserted at positions 4 and 5
                currentUserService, paymentProvider, mailService, siteConfigService);

        Enrollment e = s.enroll(2L);

        assertThat(e.getUser()).isEqualTo(u);
        assertThat(e.getCourse()).isEqualTo(c);
        assertThat(e.getStatus()).isEqualTo(Enrollment.Status.ENROLLED);
    }
}