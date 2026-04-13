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
    private final FlagshipVideoRepository flagshipVideoRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final EnrollmentService enrollmentService;
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
            // Certificate is NOT auto-generated here — admin generates it manually
            // after reviewing and entering marks via the User Management dialog.
        }
        return p;
    }

    public VideoProgress getProgress(Long videoId) {
        User user = currentUserService.getCurrentUser();
        Video v = videoRepo.findById(videoId).orElseThrow(() -> new IllegalArgumentException("Video not found"));
        return progressRepo.findByUserAndVideo(user, v).orElse(null);
    }

    @Transactional
    public VideoProgress updateFlagshipVideoProgress(Long flagshipVideoId, Long lastPositionSeconds, boolean markCompleted) {
        User user = currentUserService.getCurrentUser();
        FlagshipVideo fv = flagshipVideoRepo.findById(flagshipVideoId)
                .orElseThrow(() -> new IllegalArgumentException("Flagship video not found"));

        VideoProgress p = progressRepo.findByUserAndFlagshipVideo(user, fv)
                .orElseGet(() -> VideoProgress.builder().user(user).flagshipVideo(fv).build());
        if (lastPositionSeconds != null) {
            p.setLastPositionSeconds(lastPositionSeconds);
        }
        p.setLastSeenAt(LocalDateTime.now());
        if (markCompleted || (fv.getDurationSeconds() != null && lastPositionSeconds != null
                && lastPositionSeconds >= fv.getDurationSeconds())) {
            p.setCompleted(true);
        }
        return progressRepo.save(p);
    }

    public VideoProgress getFlagshipVideoProgress(Long flagshipVideoId) {
        User user = currentUserService.getCurrentUser();
        FlagshipVideo fv = flagshipVideoRepo.findById(flagshipVideoId)
                .orElseThrow(() -> new IllegalArgumentException("Flagship video not found"));
        return progressRepo.findByUserAndFlagshipVideo(user, fv).orElse(null);
    }
}