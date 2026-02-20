package com.uyirgene.course;

import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VideoProgressService {
    private final VideoProgressRepository progressRepo;
    private final VideoRepository videoRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final EnrollmentService enrollmentService;
    private final CertificateService certificateService;
    private final CurrentUserService currentUserService;

    @Transactional
    public VideoProgress updateProgress(Long videoId, Long lastPositionSeconds, boolean markCompleted) {
        User user = currentUserService.getCurrentUser();
        Video v = videoRepo.findById(videoId).orElseThrow(() -> new IllegalArgumentException("Video not found"));

        // check enrollment
        Enrollment e = enrollmentRepo.findByUserAndCourse(user, v.getCourse()).orElseThrow(() -> new SecurityException("User not enrolled"));

        VideoProgress p = progressRepo.findByUserAndVideo(user, v).orElseGet(() -> VideoProgress.builder().user(user).video(v).build());
        if (lastPositionSeconds != null) {
            p.setLastPositionSeconds(lastPositionSeconds);
        }
        p.setLastSeenAt(LocalDateTime.now());
        if (markCompleted || (v.getDurationSeconds() != null && lastPositionSeconds != null && lastPositionSeconds >= v.getDurationSeconds())) {
            p.setCompleted(true);
        }
        p = progressRepo.save(p);

        // check course completion
        List<Video> videos = videoRepo.findByCourseOrderByOrderIndex(v.getCourse());
        boolean allCompleted = videos.stream().allMatch(video -> {
            return progressRepo.findByUserAndVideo(user, video).map(VideoProgress::getCompleted).orElse(false);
        });
        if (allCompleted) {
            enrollmentService.markCompleted(e);
            certificateService.generateCertificate(user, v.getCourse());
        }
        return p;
    }

    public VideoProgress getProgress(Long videoId) {
        User user = currentUserService.getCurrentUser();
        Video v = videoRepo.findById(videoId).orElseThrow(() -> new IllegalArgumentException("Video not found"));
        return progressRepo.findByUserAndVideo(user, v).orElse(null);
    }
}