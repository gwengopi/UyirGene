package com.uyirgene.course;

import com.uyirgene.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VideoProgressRepository extends JpaRepository<VideoProgress, Long> {
    Optional<VideoProgress> findByUserAndVideo(User user, Video video);
    Optional<VideoProgress> findByUserAndFlagshipVideo(User user, FlagshipVideo flagshipVideo);
    void deleteByVideo(Video video);
}