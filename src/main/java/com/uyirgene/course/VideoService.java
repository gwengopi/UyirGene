package com.uyirgene.course;

import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VideoService {
    private final VideoRepository videoRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final CourseRepository courseRepo;
    private final CurrentUserService currentUserService;

    public List<Video> listCourseVideos(Long courseId) {
        Course course = courseRepo.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Course not found"));
        User user = currentUserService.getCurrentUser();
        boolean enrolled = enrollmentRepo.findByUserAndCourse(user, course).isPresent();
        if (!enrolled) throw new SecurityException("User not enrolled in course");
        return videoRepo.findByCourseOrderByOrderIndex(course);
    }
}