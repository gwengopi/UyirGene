package com.uyirgene.course;

import com.uyirgene.course.dto.EnrollmentResult;
import com.uyirgene.course.payment.PaymentProvider;
import com.uyirgene.course.payment.dto.PaymentOrder;
import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepo;
    private final CourseRepository courseRepo;
    private final CurrentUserService currentUserService;
    private final PaymentProvider paymentProvider;
    private final com.uyirgene.course.MailService mailService;

    public Enrollment enroll(Long courseId) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId).orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));
        return enrollmentRepo.findByUserAndCourse(u, c).orElseGet(() -> {
            Enrollment e = Enrollment.builder()
                    .user(u)
                    .course(c)
                    .enrolledAt(LocalDateTime.now())
                    .status(Enrollment.Status.ENROLLED)
                    .build();
            Enrollment saved = enrollmentRepo.save(e);
            // send confirmation email for free enrollments
            if (c.getPrice() == null || c.getPrice() == 0) {
                mailService.sendEnrollmentSuccess(u, c);
            }
            return saved;
        });
    }

    public EnrollmentResult startEnrollment(Long courseId) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId).orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));
        Enrollment existing = enrollmentRepo.findByUserAndCourse(u, c).orElse(null);
        if (existing != null) {
            if (existing.getStatus() == Enrollment.Status.ENROLLED) {
                return new EnrollmentResult(existing, null);
            }
            if (existing.getStatus() == Enrollment.Status.PENDING) {
                // in a real app we'd attach previous order info; for simplicity, create a new order
            }
        }

        if (c.getPrice() == null || c.getPrice() == 0) {
            Enrollment e = enroll(courseId);
            return new EnrollmentResult(e, null);
        }

        // paid course: create PENDING enrollment and razorpay order
        Enrollment e = Enrollment.builder()
                .user(u)
                .course(c)
                .enrolledAt(LocalDateTime.now())
                .status(Enrollment.Status.PENDING)
                .build();
        Enrollment saved = enrollmentRepo.save(e);

        long amountPaise = Math.round((c.getPrice() == null ? 0.0 : c.getPrice()) * 100);
        PaymentOrder po = paymentProvider.createOrder(amountPaise, "enroll-" + saved.getId());
        EnrollmentResult.RazorpayOrder order = new EnrollmentResult.RazorpayOrder(po.getId(), po.getAmount(), po.getCurrency(), po.getKeyId());
        return new EnrollmentResult(null, order);
    }

    public void confirmEnrollmentPayment(Long courseId, String razorpayPaymentId, String razorpayOrderId, String signature) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId).orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));
        Enrollment e = enrollmentRepo.findByUserAndCourse(u, c).orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Enrollment not found"));
        boolean ok = paymentProvider.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!ok) throw new com.uyirgene.exception.PaymentException("Invalid payment signature");
        e.setStatus(Enrollment.Status.ENROLLED);
        enrollmentRepo.save(e);
        mailService.sendEnrollmentSuccess(u, c);
    }

    public boolean isEnrolled(User u, Course c) {
        return enrollmentRepo.findByUserAndCourse(u, c).isPresent();
    }

    public void markCompleted(Enrollment e) {
        e.setStatus(Enrollment.Status.COMPLETED);
        enrollmentRepo.save(e);
    }

    public void completeEnrollment(Long courseId) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId).orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));
        Enrollment e = enrollmentRepo.findByUserAndCourse(u, c).orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Enrollment not found"));
        markCompleted(e);
    }

    public void unenroll(Long courseId) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId).orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));
        Enrollment e = enrollmentRepo.findByUserAndCourse(u, c).orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Enrollment not found"));
        enrollmentRepo.delete(e);
    }

    public java.util.List<Course> listEnrolledCourses() {
        User u = currentUserService.getCurrentUser();
        return enrollmentRepo.findByUser(u).stream().map(Enrollment::getCourse).collect(Collectors.toList());
    }

    public java.util.List<EnrollmentDto> listEnrolledEnrollments() {
        User u = currentUserService.getCurrentUser();
        return enrollmentRepo.findByUser(u).stream()
                .map(e -> new EnrollmentDto(e.getCourse(), e.getStatus()))
                .collect(Collectors.toList());
    }
}