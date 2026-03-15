package com.uyirgene.course;

import com.uyirgene.course.dto.VideoDto;
import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.Role;
import com.uyirgene.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoService {
    private final VideoRepository videoRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final CourseRepository courseRepo;
    private final CurrentUserService currentUserService;
    private final VideoUrlEncryptionService encryptionService;

    /**
     * List course videos for enrolled users with encrypted URLs
     */
    public List<VideoDto> listCourseVideosEncrypted(Long courseId) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        User user = currentUserService.getCurrentUser();

        // Admin bypasses enrollment check
        if (user.getRole() != Role.ADMIN) {
            Enrollment enrollment = enrollmentRepo.findByUserAndCourse(user, course).orElse(null);
            if (enrollment == null ||
                (enrollment.getStatus() != Enrollment.Status.ENROLLED &&
                 enrollment.getStatus() != Enrollment.Status.COMPLETED)) {
                throw new SecurityException("User not enrolled in course");
            }
        }

        return videoRepo.findByCourseOrderByOrderIndex(course).stream()
                .map(video -> VideoDto.fromEntity(video, encryptionService.encryptUrl(video.getUrl())))
                .collect(Collectors.toList());
    }

    /**
     * Legacy method - returns raw Video entities (for admin use)
     */
    public List<Video> listCourseVideos(Long courseId) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        User user = currentUserService.getCurrentUser();
        boolean enrolled = enrollmentRepo.findByUserAndCourse(user, course)
                .map(e -> e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED)
                .orElse(false);
        if (!enrolled) throw new SecurityException("User not enrolled in course");
        return videoRepo.findByCourseOrderByOrderIndex(course);
    }

    /**
     * Decrypt a video URL for playback
     */
    public String decryptVideoUrl(String encryptedUrl) {
        return encryptionService.decryptUrl(encryptedUrl);
    }
}