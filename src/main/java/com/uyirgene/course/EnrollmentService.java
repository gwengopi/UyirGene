package com.uyirgene.course;

import com.uyirgene.config.SiteConfigService;
import com.uyirgene.course.dto.CourseDto;
import com.uyirgene.course.dto.EnrollmentResult;
import com.uyirgene.course.payment.PaymentProvider;
import com.uyirgene.course.payment.dto.PaymentOrder;
import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentRepository enrollmentRepo;
    private final CourseRepository courseRepo;
    private final CoursePriceRepository coursePriceRepo;
    private final FlagshipProgramRepository flagshipProgramRepo;
    private final FlagshipProgramPriceRepository flagshipPriceRepo;
    private final CurrentUserService currentUserService;
    private final PaymentProvider paymentProvider;
    private final MailService mailService;
    private final SiteConfigService siteConfigService;

    // ==================== Course Enrollment ====================

    public Optional<Enrollment> getExistingEnrollment(User user, Course course) {
        return enrollmentRepo.findByUserAndCourse(user, course);
    }

    @Transactional
    public Enrollment enroll(Long courseId) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));

        Optional<Enrollment> existing = enrollmentRepo.findByUserAndCourse(u, c);
        if (existing.isPresent()) {
            Enrollment e = existing.get();
            if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
                throw new IllegalStateException("You are already enrolled in this course");
            }
        }

        Enrollment e = Enrollment.builder()
                .user(u)
                .course(c)
                .enrolledAt(LocalDateTime.now())
                .status(Enrollment.Status.ENROLLED)
                .build();
        Enrollment saved = enrollmentRepo.save(e);

        if (c.getPrice() == null || c.getPrice() == 0) {
            mailService.sendEnrollmentSuccess(u, c);
        }
        return saved;
    }

    @Transactional
    public EnrollmentResult startEnrollment(Long courseId, String countryCode) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));

        Double resolvedPrice;
        String resolvedCurrency;
        if (countryCode != null && !countryCode.isBlank() && !"IN".equalsIgnoreCase(countryCode)) {
            Optional<CoursePrice> countryPrice = coursePriceRepo.findByCourseAndCountryCode(c, countryCode.toUpperCase());
            if (countryPrice.isPresent()) {
                resolvedPrice = countryPrice.get().getAmount();
                resolvedCurrency = countryPrice.get().getCurrencyCode();
            } else {
                resolvedPrice = c.getPrice();
                resolvedCurrency = "INR";
            }
        } else {
            resolvedPrice = c.getPrice();
            resolvedCurrency = "INR";
        }

        // Free course check — do this early so PENDING upgrades to ENROLLED immediately
        boolean isFree = (resolvedPrice == null || resolvedPrice == 0);

        Optional<Enrollment> existingOpt = enrollmentRepo.findByUserAndCourse(u, c);
        if (existingOpt.isPresent()) {
            Enrollment existing = existingOpt.get();
            if (existing.getStatus() == Enrollment.Status.ENROLLED ||
                existing.getStatus() == Enrollment.Status.COMPLETED) {
                return new EnrollmentResult(existing, null, true, "You are already enrolled in this course");
            }
            if (existing.getStatus() == Enrollment.Status.PENDING && existing.getPaymentOrderId() != null) {
                // Price may have changed to free after the pending order was created — complete for free
                if (isFree) {
                    existing.setStatus(Enrollment.Status.ENROLLED);
                    existing.setEnrolledAt(java.time.LocalDateTime.now());
                    enrollmentRepo.save(existing);
                    return new EnrollmentResult(existing, null, false, null);
                }
                long amount = Math.round(resolvedPrice * 100);
                EnrollmentResult.RazorpayOrder order = new EnrollmentResult.RazorpayOrder(
                        existing.getPaymentOrderId(), amount, resolvedCurrency, paymentProvider.getKeyId());
                return new EnrollmentResult(null, order, false, null);
            }
        }

        if (isFree) {
            Enrollment e = enroll(courseId);
            return new EnrollmentResult(e, null, false, null);
        }

        Enrollment enrollment = existingOpt.orElseGet(() -> Enrollment.builder()
                .user(u)
                .course(c)
                .enrolledAt(LocalDateTime.now())
                .status(Enrollment.Status.PENDING)
                .build());

        long amountSmallestUnit = Math.round(resolvedPrice * 100);
        PaymentOrder po = paymentProvider.createOrder(amountSmallestUnit, resolvedCurrency,
                "enroll-" + (enrollment.getId() != null ? enrollment.getId() : System.currentTimeMillis()));

        enrollment.setPaymentOrderId(po.getId());
        enrollment.setPaymentCurrency(resolvedCurrency);
        enrollment.setPaymentAmount(resolvedPrice);
        enrollment.setStatus(Enrollment.Status.PENDING);
        enrollmentRepo.save(enrollment);

        EnrollmentResult.RazorpayOrder order = new EnrollmentResult.RazorpayOrder(
                po.getId(), po.getAmount(), po.getCurrency(), po.getKeyId());
        return new EnrollmentResult(null, order, false, null);
    }

    @Transactional
    public Enrollment confirmEnrollmentPayment(Long courseId, String razorpayPaymentId,
                                               String razorpayOrderId, String signature) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));
        Enrollment e = enrollmentRepo.findByUserAndCourse(u, c)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Enrollment not found"));

        if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
            return e;
        }
        if (e.getPaymentOrderId() == null || !e.getPaymentOrderId().equals(razorpayOrderId)) {
            throw new com.uyirgene.exception.PaymentException("Payment order does not match this enrollment");
        }
        boolean ok = paymentProvider.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!ok) throw new com.uyirgene.exception.PaymentException("Invalid payment signature");

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

    public void markCompleted(Enrollment e) {
        e.setStatus(Enrollment.Status.COMPLETED);
        enrollmentRepo.save(e);
    }

    @Transactional
    public void unenroll(Long courseId) {
        User u = currentUserService.getCurrentUser();
        Course c = courseRepo.findById(courseId)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Course not found"));
        Enrollment e = enrollmentRepo.findByUserAndCourse(u, c)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Enrollment not found"));
        enrollmentRepo.delete(e);
    }

    public List<Course> listEnrolledCourses() {
        User u = currentUserService.getCurrentUser();
        return enrollmentRepo.findByUser(u).stream()
                .filter(e -> e.getCourse() != null)
                .filter(e -> e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED)
                .map(Enrollment::getCourse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EnrollmentDto> listEnrolledEnrollments() {
        User u = currentUserService.getCurrentUser();
        return enrollmentRepo.findByUser(u).stream()
                .filter(e -> e.getCourse() != null)
                .filter(e -> e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED)
                .map(e -> new EnrollmentDto(CourseDto.fromEntity(e.getCourse()), e.getStatus()))
                .collect(Collectors.toList());
    }

    // ==================== Flagship Program Enrollment ====================

    @Transactional
    public EnrollmentResult startFlagshipEnrollment(Long programId, String countryCode) {
        User u = currentUserService.getCurrentUser();
        FlagshipProgram program = flagshipProgramRepo.findById(programId)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Flagship program not found"));

        Double resolvedPrice;
        String resolvedCurrency;
        if (countryCode != null && !countryCode.isBlank() && !"IN".equalsIgnoreCase(countryCode)) {
            Optional<FlagshipProgramPrice> countryPrice =
                    flagshipPriceRepo.findByFlagshipProgramAndCountryCode(program, countryCode.toUpperCase());
            if (countryPrice.isPresent()) {
                resolvedPrice = countryPrice.get().getAmount();
                resolvedCurrency = countryPrice.get().getCurrencyCode();
            } else {
                resolvedPrice = program.getPrice();
                resolvedCurrency = "INR";
            }
        } else {
            resolvedPrice = program.getPrice();
            resolvedCurrency = "INR";
        }

        Optional<Enrollment> existingOpt = enrollmentRepo.findByUserAndFlagshipProgram(u, program);
        if (existingOpt.isPresent()) {
            Enrollment existing = existingOpt.get();
            if (existing.getStatus() == Enrollment.Status.ENROLLED ||
                existing.getStatus() == Enrollment.Status.COMPLETED) {
                return new EnrollmentResult(existing, null, true, "You are already enrolled in this program");
            }
            if (existing.getStatus() == Enrollment.Status.PENDING && existing.getPaymentOrderId() != null) {
                long amount = Math.round((resolvedPrice == null ? 0.0 : resolvedPrice) * 100);
                EnrollmentResult.RazorpayOrder order = new EnrollmentResult.RazorpayOrder(
                        existing.getPaymentOrderId(), amount, resolvedCurrency, paymentProvider.getKeyId());
                return new EnrollmentResult(null, order, false, null);
            }
        }

        // Free program
        if (resolvedPrice == null || resolvedPrice == 0) {
            Enrollment e = Enrollment.builder()
                    .user(u)
                    .flagshipProgram(program)
                    .enrolledAt(LocalDateTime.now())
                    .status(Enrollment.Status.ENROLLED)
                    .build();
            Enrollment saved = enrollmentRepo.save(e);
            mailService.sendEnrollmentSuccess(u, program);
            return new EnrollmentResult(saved, null, false, null);
        }

        // Paid program
        Enrollment enrollment = existingOpt.orElseGet(() -> Enrollment.builder()
                .user(u)
                .flagshipProgram(program)
                .enrolledAt(LocalDateTime.now())
                .status(Enrollment.Status.PENDING)
                .build());

        long amountSmallestUnit = Math.round(resolvedPrice * 100);
        PaymentOrder po = paymentProvider.createOrder(amountSmallestUnit, resolvedCurrency,
                "flagship-" + (enrollment.getId() != null ? enrollment.getId() : System.currentTimeMillis()));

        enrollment.setPaymentOrderId(po.getId());
        enrollment.setPaymentCurrency(resolvedCurrency);
        enrollment.setPaymentAmount(resolvedPrice);
        enrollment.setStatus(Enrollment.Status.PENDING);
        enrollmentRepo.save(enrollment);

        EnrollmentResult.RazorpayOrder order = new EnrollmentResult.RazorpayOrder(
                po.getId(), po.getAmount(), po.getCurrency(), po.getKeyId());
        return new EnrollmentResult(null, order, false, null);
    }

    @Transactional
    public Enrollment confirmFlagshipEnrollmentPayment(Long programId, String razorpayPaymentId,
                                                       String razorpayOrderId, String signature) {
        User u = currentUserService.getCurrentUser();
        FlagshipProgram program = flagshipProgramRepo.findById(programId)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Flagship program not found"));
        Enrollment e = enrollmentRepo.findByUserAndFlagshipProgram(u, program)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Enrollment not found"));

        if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
            return e;
        }
        if (e.getPaymentOrderId() == null || !e.getPaymentOrderId().equals(razorpayOrderId)) {
            throw new com.uyirgene.exception.PaymentException("Payment order does not match this enrollment");
        }
        boolean ok = paymentProvider.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!ok) throw new com.uyirgene.exception.PaymentException("Invalid payment signature");

        e.setStatus(Enrollment.Status.ENROLLED);
        Enrollment saved = enrollmentRepo.save(e);
        mailService.sendEnrollmentSuccess(u, program);
        return saved;
    }

    public boolean isFlagshipEnrolled(User u, FlagshipProgram program) {
        return enrollmentRepo.findByUserAndFlagshipProgram(u, program)
                .map(e -> e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED)
                .orElse(false);
    }

    @Transactional
    public void unenrollFlagship(Long programId) {
        User u = currentUserService.getCurrentUser();
        FlagshipProgram program = flagshipProgramRepo.findById(programId)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Flagship program not found"));
        Enrollment e = enrollmentRepo.findByUserAndFlagshipProgram(u, program)
                .orElseThrow(() -> new com.uyirgene.exception.EntityNotFoundException("Enrollment not found"));
        enrollmentRepo.delete(e);
    }

    public List<FlagshipProgram> listEnrolledFlagshipPrograms() {
        User u = currentUserService.getCurrentUser();
        return enrollmentRepo.findByUser(u).stream()
                .filter(e -> e.getFlagshipProgram() != null)
                .filter(e -> e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED)
                .map(Enrollment::getFlagshipProgram)
                .collect(Collectors.toList());
    }

    // ==================== Shared ====================

    public double getPassMarkPercentage() {
        String passMarkStr = siteConfigService.getConfigValue("PASS_MARK_PERCENTAGE", "60");
        try {
            return Double.parseDouble(passMarkStr);
        } catch (NumberFormatException e) {
            return 60.0;
        }
    }
}
