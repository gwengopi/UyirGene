package com.uyirgene.course;

import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepo;
    private final CourseRepository courseRepo;
    private final CurrentUserService currentUserService;

    public Enrollment enroll(Long courseId) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Course not found"));
        return enrollmentRepo.findByUserAndCourse(u, c).orElseGet(() -> {
            Enrollment e = Enrollment.builder()
                    .user(u)
                    .course(c)
                    .enrolledAt(LocalDateTime.now())
                    .status(Enrollment.Status.ENROLLED)
                    .build();
            return enrollmentRepo.save(e);
        });
    }

    public boolean isEnrolled(User u, Course c) {
        return enrollmentRepo.findByUserAndCourse(u, c).isPresent();
    }

    public void markCompleted(Enrollment e) {
        e.setStatus(Enrollment.Status.COMPLETED);
        enrollmentRepo.save(e);
    }
}