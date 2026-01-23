package com.uyirgene.course;

import com.uyirgene.config.SiteConfigService;
import com.uyirgene.course.dto.EnrollmentResult;
import com.uyirgene.course.payment.PaymentProvider;
import com.uyirgene.course.payment.dto.PaymentOrder;
import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepo;
    private final CourseRepository courseRepo;
    private final CurrentUserService currentUserService;
    private final PaymentProvider paymentProvider;
    private final MailService mailService;
    private final SiteConfigService siteConfigService;

    /**
     * Check if user is already enrolled in a course
     */
    public Optional<Enrollment> getExistingEnrollment(User user, Course course) {
        return enrollmentRepo.findByUserAndCourse(user, course);
    }

    /**
     * Enroll user in a free course
     */
    @Transactional
    public Enrollment enroll(Long courseId) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));

        // Check for existing enrollment
        Optional<Enrollment> existing = enrollmentRepo.findByUserAndCourse(u, c);
        if (existing.isPresent()) {
            Enrollment e = existing.get();
            if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
                throw new IllegalStateException("You are already enrolled in this course");
            }
            // If PENDING, allow re-enrollment (payment might have failed)
        }

        Enrollment e = Enrollment.builder()
                .user(u)
                .course(c)
                .enrolledAt(LocalDateTime.now())
                .status(Enrollment.Status.ENROLLED)
                .build();
        Enrollment saved = enrollmentRepo.save(e);

        // Send confirmation email for free enrollments
        if (c.getPrice() == null || c.getPrice() == 0) {
            mailService.sendEnrollmentSuccess(u, c);
        }
        return saved;
    }

    /**
     * Start enrollment process - handles both free and paid courses
     * Returns existing enrollment info if already enrolled (idempotent)
     */
    @Transactional
    public EnrollmentResult startEnrollment(Long courseId) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));

        // Check for existing enrollment
        Optional<Enrollment> existingOpt = enrollmentRepo.findByUserAndCourse(u, c);
        if (existingOpt.isPresent()) {
            Enrollment existing = existingOpt.get();

            // Already enrolled or completed - return existing enrollment with message
            if (existing.getStatus() == Enrollment.Status.ENROLLED ||
                existing.getStatus() == Enrollment.Status.COMPLETED) {
                return new EnrollmentResult(existing, null, true, "You are already enrolled in this course");
            }

            // PENDING status - check if there's an existing payment order (idempotency)
            if (existing.getStatus() == Enrollment.Status.PENDING && existing.getPaymentOrderId() != null) {
                // Return existing order for retry
                long amountPaise = Math.round((c.getPrice() == null ? 0.0 : c.getPrice()) * 100);
                EnrollmentResult.RazorpayOrder order = new EnrollmentResult.RazorpayOrder(
                        existing.getPaymentOrderId(),
                        amountPaise,
                        "INR",
                        paymentProvider.getKeyId()
                );
                return new EnrollmentResult(null, order, false, null);
            }
        }

        // Free course - direct enrollment
        if (c.getPrice() == null || c.getPrice() == 0) {
            Enrollment e = enroll(courseId);
            return new EnrollmentResult(e, null, false, null);
        }

        // Paid course - create or update PENDING enrollment and create new payment order
        Enrollment enrollment = existingOpt.orElseGet(() -> Enrollment.builder()
                .user(u)
                .course(c)
                .enrolledAt(LocalDateTime.now())
                .status(Enrollment.Status.PENDING)
                .build());

        // Create payment order
        long amountPaise = Math.round(c.getPrice() * 100);
        PaymentOrder po = paymentProvider.createOrder(amountPaise, "enroll-" + (enrollment.getId() != null ? enrollment.getId() : System.currentTimeMillis()));

        // Store order ID for idempotency
        enrollment.setPaymentOrderId(po.getId());
        enrollment.setStatus(Enrollment.Status.PENDING);
        enrollmentRepo.save(enrollment);

        EnrollmentResult.RazorpayOrder order = new EnrollmentResult.RazorpayOrder(
                po.getId(), po.getAmount(), po.getCurrency(), po.getKeyId()
        );
        return new EnrollmentResult(null, order, false, null);
    }

    /**
     * Confirm payment for enrollment (idempotent)
     */
    @Transactional
    public Enrollment confirmEnrollmentPayment(Long courseId, String razorpayPaymentId, String razorpayOrderId, String signature) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));
        Enrollment e = enrollmentRepo.findByUserAndCourse(u, c)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Enrollment not found"));

        // Idempotency check - if already enrolled, return success
        if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
            return e;
        }

        // Verify payment signature
        boolean ok = paymentProvider.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!ok) {
            throw new com.uyirgene.exception.PaymentException("Invalid payment signature");
        }

        e.setStatus(Enrollment.Status.ENROLLED);
        Enrollment saved = enrollmentRepo.save(e);
        mailService.sendEnrollmentSuccess(u, c);
        return saved;
    }

    public boolean isEnrolled(User u, Course c) {
        return enrollmentRepo.findByUserAndCourse(u, c)
                .map(e -> e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED)
                .orElse(false);
    }

    /**
     * Mark enrollment as completed (internal use)
     */
    public void markCompleted(Enrollment e) {
        e.setStatus(Enrollment.Status.COMPLETED);
        enrollmentRepo.save(e);
    }

    /**
     * Unenroll user from a course
     */
    @Transactional
    public void unenroll(Long courseId) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));
        Enrollment e = enrollmentRepo.findByUserAndCourse(u, c)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Enrollment not found"));
        enrollmentRepo.delete(e);
    }

    public java.util.List<Course> listEnrolledCourses() {
        User u = currentUserService.getCurrentUser();
        return enrollmentRepo.findByUser(u).stream()
                .filter(e -> e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED)
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());
    }

    public java.util.List<EnrollmentDto> listEnrolledEnrollments() {
        User u = currentUserService.getCurrentUser();
        return enrollmentRepo.findByUser(u).stream()
                .map(e -> new EnrollmentDto(e.getCourse(), e.getStatus()))
                .collect(Collectors.toList());
    }

    /**
     * Get pass mark percentage from configuration
     */
    public double getPassMarkPercentage() {
        String passMarkStr = siteConfigService.getConfigValue("PASS_MARK_PERCENTAGE", "60");
        try {
            return Double.parseDouble(passMarkStr);
        } catch (NumberFormatException e) {
            return 60.0; // default
        }
    }
}