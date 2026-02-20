package com.uyirgene.course;

import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final MailService mailService;
    private final CourseRepository courseRepository;
    private final CourseBundleRepository bundleRepository;
    private final CurrentUserService currentUserService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Data
    public static class PaymentFailedRequest {
        private Long courseId;
        private Long bundleId;
        private String reason;
    }

    @PostMapping("/failed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> notifyPaymentFailed(@RequestBody PaymentFailedRequest req) {
        try {
            User user = currentUserService.getCurrentUser();

            String courseTitle;
            String retryUrl;

            if (req.getCourseId() != null) {
                Course course = courseRepository.findById(req.getCourseId()).orElse(null);
                courseTitle = course != null ? course.getTitle() : "your course";
                retryUrl = baseUrl + "/courses/" + req.getCourseId();
            } else if (req.getBundleId() != null) {
                CourseBundle bundle = bundleRepository.findById(req.getBundleId()).orElse(null);
                courseTitle = bundle != null ? bundle.getTitle() : "your bundle";
                retryUrl = baseUrl + "/bundles/" + req.getBundleId();
            } else {
                courseTitle = "your course";
                retryUrl = baseUrl + "/courses";
            }

            mailService.sendPaymentFailed(
                    user.getEmail(),
                    user.getName(),
                    courseTitle,
                    req.getReason(),
                    retryUrl
            );
        } catch (Exception e) {
            log.error("Failed to send payment failure notification: {}", e.getMessage());
        }
        return ResponseEntity.ok().build();
    }
}
