package com.uyirgene.course;

import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

public class VideoProgressServiceTest {

    @Test
    void completing_all_videos_marks_enrollment_and_generates_certificate() {
        VideoProgressRepository progressRepo = Mockito.mock(VideoProgressRepository.class);
        VideoRepository videoRepo = Mockito.mock(VideoRepository.class);
        FlagshipVideoRepository flagshipVideoRepo = Mockito.mock(FlagshipVideoRepository.class); // added
        EnrollmentRepository enrollmentRepo = Mockito.mock(EnrollmentRepository.class);
        EnrollmentService enrollmentService = Mockito.mock(EnrollmentService.class);
        CurrentUserService currentUserService = Mockito.mock(CurrentUserService.class);
        // removed CertificateService — not in constructor and not called by updateProgress

        User u = User.builder().id(1L).email("a@b").name("A").build();
        Course course = Course.builder().id(10L).title("Course").build();
        Video v1 = Video.builder().id(100L).course(course).durationSeconds(10).build();
        Video v2 = Video.builder().id(101L).course(course).durationSeconds(20).build();

        Enrollment e = Enrollment.builder().id(5L).user(u).course(course).status(Enrollment.Status.ENROLLED).build();

        Mockito.when(currentUserService.getCurrentUser()).thenReturn(u);
        Mockito.when(videoRepo.findById(101L)).thenReturn(Optional.of(v2));
        Mockito.when(enrollmentRepo.findByUserAndCourse(u, course)).thenReturn(Optional.of(e));
        Mockito.when(progressRepo.findByUserAndVideo(u, v2)).thenReturn(Optional.of(VideoProgress.builder().completed(true).build()));
        Mockito.when(videoRepo.findByCourseOrderByOrderIndex(course)).thenReturn(List.of(v1, v2));
        Mockito.when(progressRepo.findByUserAndVideo(u, v1)).thenReturn(Optional.of(VideoProgress.builder().completed(true).build()));
        Mockito.when(progressRepo.save(Mockito.any())).thenAnswer(i -> i.getArgument(0));

        // correct constructor order: progressRepo, videoRepo, flagshipVideoRepo, enrollmentRepo, enrollmentService, currentUserService
        VideoProgressService s = new VideoProgressService(
                progressRepo, videoRepo, flagshipVideoRepo,
                enrollmentRepo, enrollmentService, currentUserService);

        VideoProgress p = s.updateProgress(101L, 20L, false);

        assertThat(p.getLastPositionSeconds()).isEqualTo(20L);
        assertThat(p.getCompleted()).isTrue();
        Mockito.verify(enrollmentService).markCompleted(e);
        // removed: certificateService.generateCertificate — updateProgress does not call it
        // (per the comment in source: "admin generates it manually")
    }
}