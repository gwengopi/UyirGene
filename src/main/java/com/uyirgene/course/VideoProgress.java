package com.uyirgene.course;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.uyirgene.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VideoProgress {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(optional = false)
    private User user;

    @JsonIgnore
    @ManyToOne(optional = true)
    private Video video;

    @JsonIgnore
    @ManyToOne(optional = true)
    @JoinColumn(name = "flagship_video_id")
    private FlagshipVideo flagshipVideo;

    private Long lastPositionSeconds;
    private LocalDateTime lastSeenAt;

    private Boolean completed = false;

    @JsonProperty("videoId")
    public Long getVideoId() {
        if (video != null) return video.getId();
        if (flagshipVideo != null) return flagshipVideo.getId();
        return null;
    }

    @JsonProperty("userId")
    public Long getUserId() {
        return user != null ? user.getId() : null;
    }
}