package com.uyirgene.course;

import com.uyirgene.course.dto.EnrollmentResult;
import com.uyirgene.course.payment.PaymentProvider;
import com.uyirgene.course.payment.dto.PaymentContactDetails;
import com.uyirgene.course.payment.dto.PaymentOrder;
import com.uyirgene.exception.EntityNotFoundException;
import com.uyirgene.exception.PaymentException;
import com.uyirgene.user.User;
import com.uyirgene.user.UserRepository;
import com.uyirgene.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Optional;

/**
 * Handles enrollment for unauthenticated (guest) users.
 * <p>
 * Flow:
 * 1. Guest provides name/email/phone + selects course/flagship.
 * 2. {@link #startGuestCourseEnrollment} / {@link #startGuestFlagshipEnrollment} creates or finds
 *    the user by email, creates a PENDING enrollment, and returns a Razorpay order.
 * 3. After Razorpay payment succeeds on the frontend, {@link #confirmGuestCoursePayment} /
 *    {@link #confirmGuestFlagshipPayment} verifies the signature, marks ENROLLED, generates a
 *    magic-link token (if the account has no explicitly-set password), and sends the enrollment
 *    email containing the magic link.
 * <p>
 * The magic link is valid for 30 days and may be used multiple times until the user explicitly
 * sets a password (via profile update or forgot-password flow), at which point it is cleared.
 */
@Service
@RequiredArgsConstructor
public class GuestEnrollmentService {

    private final EnrollmentRepository enrollmentRepo;
    private final UserRepository userRepository;
    private final CourseRepository courseRepo;
    private final CoursePriceRepository coursePriceRepo;
    private final FlagshipProgramRepository flagshipProgramRepo;
    private final FlagshipProgramPriceRepository flagshipPriceRepo;
    private final UserService userService;
    private final PaymentProvider paymentProvider;
    private final MailService mailService;
    private final CourseBundleService bundleService;
    private final EnrollmentService enrollmentService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    // ==================== Course ====================

    @Transactional
    public EnrollmentResult startGuestCourseEnrollment(String name, String email, String phone,
                                                        Long courseId, String countryCode) {
        User user = userService.findOrCreateGuestUser(name, email, phone);
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found"));

        // Existing enrolled/completed enrollment — idempotent
        Optional<Enrollment> existing = enrollmentRepo.findByUserAndCourse(user, course);
        if (existing.isPresent()) {
            Enrollment e = existing.get();
            if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
                return new EnrollmentResult(e, null, true, "You are already enrolled in this course");
            }
        }

        Double resolvedPrice;
        String resolvedCurrency;
        if (countryCode != null && !countryCode.isBlank() && !"IN".equalsIgnoreCase(countryCode)) {
            Optional<CoursePrice> cp = coursePriceRepo.findByCourseAndCountryCode(course, countryCode.toUpperCase());
            if (cp.isPresent()) {
                resolvedPrice = cp.get().getAmount();
                resolvedCurrency = cp.get().getCurrencyCode();
            } else {
                resolvedPrice = course.getPrice();
                resolvedCurrency = "INR";
            }
        } else {
            resolvedPrice = course.getPrice();
            resolvedCurrency = "INR";
        }

        boolean isFree = (resolvedPrice == null || resolvedPrice == 0);

        if (isFree) {
            Enrollment e = Enrollment.builder()
                    .user(user)
                    .course(course)
                    .enrolledAt(LocalDateTime.now())
                    .status(Enrollment.Status.ENROLLED)
                    .build();
            enrollmentRepo.save(e);
            sendEnrollmentEmailWithMagicLink(user, course);
            return new EnrollmentResult(e, null, false, null);
        }

        // Reuse existing PENDING enrollment or create new one
        Enrollment enrollment = existing.orElseGet(() -> Enrollment.builder()
                .user(user)
                .course(course)
                .enrolledAt(LocalDateTime.now())
                .status(Enrollment.Status.PENDING)
                .build());

        long amountSmallestUnit = Math.round(resolvedPrice * 100);
        PaymentOrder po = paymentProvider.createOrder(amountSmallestUnit, resolvedCurrency,
                "guest-enroll-" + (enrollment.getId() != null ? enrollment.getId() : System.currentTimeMillis()));

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
    public Enrollment confirmGuestCoursePayment(String email, Long courseId,
                                                 String razorpayPaymentId, String razorpayOrderId,
                                                 String signature) {
        User user = userService.findOrCreateGuestUser(deriveNameFromEmail(email), email, null);
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found"));

        Optional<Enrollment> existing = enrollmentRepo.findByUserAndCourse(user, course);
        Enrollment e;
        if (existing.isPresent()) {
            e = existing.get();
            if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
                return e; // idempotent
            }
            // Pending enrollment exists (guest modal flow) — validate order ID matches
            if (e.getPaymentOrderId() != null && !e.getPaymentOrderId().equals(razorpayOrderId)) {
                throw new PaymentException("Payment order does not match this enrollment");
            }
        } else {
            // No pending enrollment — anonymous flow where order was created without a user
            e = Enrollment.builder()
                    .user(user).course(course)
                    .enrolledAt(LocalDateTime.now())
                    .status(Enrollment.Status.PENDING)
                    .build();
        }

        boolean ok = paymentProvider.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!ok) throw new PaymentException("Invalid payment signature");

        e.setPaymentOrderId(razorpayOrderId);
        e.setStatus(Enrollment.Status.ENROLLED);
        Enrollment saved = enrollmentRepo.save(e);
        sendEnrollmentEmailWithMagicLink(user, course);
        return saved;
    }

    // ==================== Flagship ====================

    @Transactional
    public EnrollmentResult startGuestFlagshipEnrollment(String name, String email, String phone,
                                                          Long programId, String countryCode) {
        User user = userService.findOrCreateGuestUser(name, email, phone);
        FlagshipProgram program = flagshipProgramRepo.findById(programId)
                .orElseThrow(() -> new EntityNotFoundException("Flagship program not found"));

        Optional<Enrollment> existing = enrollmentRepo.findByUserAndFlagshipProgram(user, program);
        if (existing.isPresent()) {
            Enrollment e = existing.get();
            if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
                return new EnrollmentResult(e, null, true, "You are already enrolled in this program");
            }
        }

        Double resolvedPrice;
        String resolvedCurrency;
        if (countryCode != null && !countryCode.isBlank() && !"IN".equalsIgnoreCase(countryCode)) {
            Optional<FlagshipProgramPrice> fp =
                    flagshipPriceRepo.findByFlagshipProgramAndCountryCode(program, countryCode.toUpperCase());
            if (fp.isPresent()) {
                resolvedPrice = fp.get().getAmount();
                resolvedCurrency = fp.get().getCurrencyCode();
            } else {
                resolvedPrice = program.getPrice();
                resolvedCurrency = "INR";
            }
        } else {
            resolvedPrice = program.getPrice();
            resolvedCurrency = "INR";
        }

        boolean isFree = (resolvedPrice == null || resolvedPrice == 0);

        if (isFree) {
            Enrollment e = Enrollment.builder()
                    .user(user)
                    .flagshipProgram(program)
                    .enrolledAt(LocalDateTime.now())
                    .status(Enrollment.Status.ENROLLED)
                    .build();
            enrollmentRepo.save(e);
            enrollInFlagshipCoursesForGuest(user, program);
            return new EnrollmentResult(e, null, false, null);
        }

        Enrollment enrollment = existing.orElseGet(() -> Enrollment.builder()
                .user(user)
                .flagshipProgram(program)
                .enrolledAt(LocalDateTime.now())
                .status(Enrollment.Status.PENDING)
                .build());

        long amountSmallestUnit = Math.round(resolvedPrice * 100);
        PaymentOrder po = paymentProvider.createOrder(amountSmallestUnit, resolvedCurrency,
                "guest-flagship-" + (enrollment.getId() != null ? enrollment.getId() : System.currentTimeMillis()));

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
    public Enrollment confirmGuestFlagshipPayment(String email, Long programId,
                                                   String razorpayPaymentId, String razorpayOrderId,
                                                   String signature) {
        User user = userService.findOrCreateGuestUser(deriveNameFromEmail(email), email, null);
        FlagshipProgram program = flagshipProgramRepo.findById(programId)
                .orElseThrow(() -> new EntityNotFoundException("Flagship program not found"));

        Optional<Enrollment> existing = enrollmentRepo.findByUserAndFlagshipProgram(user, program);
        Enrollment e;
        if (existing.isPresent()) {
            e = existing.get();
            if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
                return e; // idempotent
            }
            // Pending enrollment exists (guest modal flow) — validate order ID matches
            if (e.getPaymentOrderId() != null && !e.getPaymentOrderId().equals(razorpayOrderId)) {
                throw new PaymentException("Payment order does not match this enrollment");
            }
        } else {
            // No pending enrollment — anonymous flow where order was created without a user
            e = Enrollment.builder()
                    .user(user).flagshipProgram(program)
                    .enrolledAt(LocalDateTime.now())
                    .status(Enrollment.Status.PENDING)
                    .build();
        }

        boolean ok = paymentProvider.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!ok) throw new PaymentException("Invalid payment signature");

        e.setPaymentOrderId(razorpayOrderId);
        e.setStatus(Enrollment.Status.ENROLLED);
        Enrollment saved = enrollmentRepo.save(e);
        enrollInFlagshipCoursesForGuest(user, program);
        return saved;
    }

    // ==================== Bundle ====================

    @Transactional
    public CourseBundleService.MultiEnrollmentResult startGuestBundleEnrollment(
            String name, String email, String phone,
            List<Long> bundleIds, String countryCode, Long standaloneCourseId) {
        User user = userService.findOrCreateGuestUser(name, email, phone);
        return bundleService.startGuestMultiBundleEnrollment(user, bundleIds, countryCode, standaloneCourseId);
    }

    @Transactional
    public List<Enrollment> confirmGuestBundlePayment(
            String email, List<Long> bundleIds,
            String razorpayPaymentId, String razorpayOrderId, String signature,
            Long standaloneCourseId) {
        User user = userService.findOrCreateGuestUser(deriveNameFromEmail(email), email, null);
        List<Enrollment> enrollments = bundleService.confirmGuestMultiBundlePayment(
                user, bundleIds, razorpayPaymentId, razorpayOrderId, signature, standaloneCourseId);
        // Send proper enrollment emails with magic link for guest users
        if (!enrollments.isEmpty() && user.getPassword() == null) {
            // Passwordless guest/anonymous account — always send magic link regardless of account age
            boolean isNew = isFreshGuestAccount(user); // must check BEFORE generateMagicLinkToken sets the token
            String token = userService.generateMagicLinkToken(user);
            String magicLink = frontendUrl + "/magic-login?token=" + token;
            // One email per bundle with course list + magic link CTA
            Map<Long, List<Enrollment>> byBundle = enrollments.stream()
                    .filter(e -> e.getBundle() != null)
                    .collect(Collectors.groupingBy(e -> e.getBundle().getId()));
            for (List<Enrollment> bundleEnrollments : byBundle.values()) {
                String bundleTitle = bundleEnrollments.get(0).getBundle().getTitle();
                List<String> courseTitles = bundleEnrollments.stream()
                        .filter(e -> e.getCourse() != null)
                        .map(e -> e.getCourse().getTitle())
                        .toList();
                mailService.sendGuestBundleEnrollmentSuccess(user, bundleTitle, courseTitles, magicLink, isNew);
            }

            // Standalone course (not part of a bundle) — send individual enrollment email with magic link
            enrollments.stream()
                    .filter(e -> e.getBundle() == null && e.getCourse() != null)
                    .forEach(e -> mailService.sendGuestEnrollmentSuccess(user, e.getCourse(), magicLink, isNew));
        }
        return enrollments;
    }

    // ==================== Anonymous (Razorpay-collect) enrollment ====================
    // No pre-enrollment form — Razorpay collects email/phone during checkout.
    // On confirm, backend fetches the payer's contact from Razorpay and creates/finds the user.

    public EnrollmentResult.RazorpayOrder startAnonymousCourseOrder(Long courseId, String countryCode) {
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found"));

        Double resolvedPrice;
        String resolvedCurrency;
        if (countryCode != null && !countryCode.isBlank() && !"IN".equalsIgnoreCase(countryCode)) {
            Optional<CoursePrice> cp = coursePriceRepo.findByCourseAndCountryCode(course, countryCode.toUpperCase());
            if (cp.isPresent()) {
                resolvedPrice = cp.get().getAmount();
                resolvedCurrency = cp.get().getCurrencyCode();
            } else {
                resolvedPrice = course.getPrice();
                resolvedCurrency = "INR";
            }
        } else {
            resolvedPrice = course.getPrice();
            resolvedCurrency = "INR";
        }

        if (resolvedPrice == null || resolvedPrice == 0) {
            throw new IllegalArgumentException("This course is free. No payment required.");
        }
        long amountSmallestUnit = Math.round(resolvedPrice * 100);
        PaymentOrder po = paymentProvider.createOrder(amountSmallestUnit, resolvedCurrency, "anon-course-" + courseId);
        return new EnrollmentResult.RazorpayOrder(po.getId(), po.getAmount(), po.getCurrency(), po.getKeyId());
    }

    @Transactional
    public Enrollment confirmAnonymousCourseOrder(Long courseId, String razorpayPaymentId,
                                                   String razorpayOrderId, String signature) {
        boolean ok = paymentProvider.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!ok) throw new PaymentException("Invalid payment signature");

        PaymentContactDetails contact = paymentProvider.fetchPaymentDetails(razorpayPaymentId);
        if (contact.email() == null || contact.email().isBlank()) {
            throw new PaymentException("Email not available from payment. Please contact support.");
        }

        User user = userService.findOrCreateGuestUser(
                deriveNameFromEmail(contact.email()), contact.email(), contact.contact());
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found"));

        Optional<Enrollment> existing = enrollmentRepo.findByUserAndCourse(user, course);
        if (existing.isPresent()) {
            Enrollment e = existing.get();
            if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
                return e;
            }
            e.setStatus(Enrollment.Status.ENROLLED);
            e.setPaymentOrderId(razorpayOrderId);
            Enrollment saved = enrollmentRepo.save(e);
            sendEnrollmentEmailWithMagicLink(user, course);
            return saved;
        }

        Enrollment e = Enrollment.builder()
                .user(user).course(course)
                .enrolledAt(LocalDateTime.now())
                .status(Enrollment.Status.ENROLLED)
                .paymentOrderId(razorpayOrderId)
                .build();
        Enrollment saved = enrollmentRepo.save(e);
        sendEnrollmentEmailWithMagicLink(user, course);
        return saved;
    }

    public EnrollmentResult.RazorpayOrder startAnonymousFlagshipOrder(Long programId, String countryCode) {
        FlagshipProgram program = flagshipProgramRepo.findById(programId)
                .orElseThrow(() -> new EntityNotFoundException("Flagship program not found"));

        Double resolvedPrice;
        String resolvedCurrency;
        if (countryCode != null && !countryCode.isBlank() && !"IN".equalsIgnoreCase(countryCode)) {
            Optional<FlagshipProgramPrice> fp =
                    flagshipPriceRepo.findByFlagshipProgramAndCountryCode(program, countryCode.toUpperCase());
            if (fp.isPresent()) {
                resolvedPrice = fp.get().getAmount();
                resolvedCurrency = fp.get().getCurrencyCode();
            } else {
                resolvedPrice = program.getPrice();
                resolvedCurrency = "INR";
            }
        } else {
            resolvedPrice = program.getPrice();
            resolvedCurrency = "INR";
        }

        if (resolvedPrice == null || resolvedPrice == 0) {
            throw new IllegalArgumentException("This program is free. No payment required.");
        }
        long amountSmallestUnit = Math.round(resolvedPrice * 100);
        PaymentOrder po = paymentProvider.createOrder(amountSmallestUnit, resolvedCurrency, "anon-flagship-" + programId);
        return new EnrollmentResult.RazorpayOrder(po.getId(), po.getAmount(), po.getCurrency(), po.getKeyId());
    }

    @Transactional
    public void confirmAnonymousFlagshipOrder(Long programId, String razorpayPaymentId,
                                               String razorpayOrderId, String signature) {
        boolean ok = paymentProvider.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!ok) throw new PaymentException("Invalid payment signature");

        PaymentContactDetails contact = paymentProvider.fetchPaymentDetails(razorpayPaymentId);
        if (contact.email() == null || contact.email().isBlank()) {
            throw new PaymentException("Email not available from payment. Please contact support.");
        }

        User user = userService.findOrCreateGuestUser(
                deriveNameFromEmail(contact.email()), contact.email(), contact.contact());
        FlagshipProgram program = flagshipProgramRepo.findById(programId)
                .orElseThrow(() -> new EntityNotFoundException("Flagship program not found"));

        Optional<Enrollment> existing = enrollmentRepo.findByUserAndFlagshipProgram(user, program);
        if (existing.isPresent()) {
            Enrollment e = existing.get();
            if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
                return;
            }
            e.setStatus(Enrollment.Status.ENROLLED);
            e.setPaymentOrderId(razorpayOrderId);
            enrollmentRepo.save(e);
        } else {
            enrollmentRepo.save(Enrollment.builder()
                    .user(user).flagshipProgram(program)
                    .enrolledAt(LocalDateTime.now())
                    .status(Enrollment.Status.ENROLLED)
                    .paymentOrderId(razorpayOrderId)
                    .build());
        }
        enrollInFlagshipCoursesForGuest(user, program);
    }

    public CourseBundleService.MultiEnrollmentResult startAnonymousBundleOrder(
            List<Long> bundleIds, String countryCode, Long standaloneCourseId) {
        // We need a temporary user to call the bundle service; create a placeholder
        // order without a user by directly using the payment provider.
        // Since bundles always have a price, we delegate to the bundle service's order creation.
        // We pass null user here — the bundle service startMultiBundleEnrollment requires an authenticated
        // user, so we use a different approach: just calculate the price and create the order directly.
        return bundleService.createAnonymousBundleOrder(bundleIds, countryCode, standaloneCourseId);
    }

    @Transactional
    public List<Enrollment> confirmAnonymousBundleOrder(
            List<Long> bundleIds, String razorpayPaymentId, String razorpayOrderId,
            String signature, Long standaloneCourseId) {
        boolean ok = paymentProvider.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!ok) throw new PaymentException("Invalid payment signature");

        PaymentContactDetails contact = paymentProvider.fetchPaymentDetails(razorpayPaymentId);
        if (contact.email() == null || contact.email().isBlank()) {
            throw new PaymentException("Email not available from payment. Please contact support.");
        }

        User user = userService.findOrCreateGuestUser(
                deriveNameFromEmail(contact.email()), contact.email(), contact.contact());
        List<Enrollment> enrollments = bundleService.confirmGuestMultiBundlePayment(
                user, bundleIds, razorpayPaymentId, razorpayOrderId, signature, standaloneCourseId);

        if (!enrollments.isEmpty()) {
            boolean isNew = isFreshGuestAccount(user); // must check BEFORE generateMagicLinkToken sets the token
            String token = userService.generateMagicLinkToken(user);
            String magicLink = frontendUrl + "/magic-login?token=" + token;

            Map<Long, List<Enrollment>> byBundle = enrollments.stream()
                    .filter(e -> e.getBundle() != null)
                    .collect(Collectors.groupingBy(e -> e.getBundle().getId()));
            for (List<Enrollment> bundleEnrollments : byBundle.values()) {
                String bundleTitle = bundleEnrollments.get(0).getBundle().getTitle();
                List<String> courseTitles = bundleEnrollments.stream()
                        .filter(e -> e.getCourse() != null)
                        .map(e -> e.getCourse().getTitle())
                        .toList();
                mailService.sendGuestBundleEnrollmentSuccess(user, bundleTitle, courseTitles, magicLink, isNew);
            }
            enrollments.stream()
                    .filter(e -> e.getBundle() == null && e.getCourse() != null)
                    .forEach(e -> mailService.sendGuestEnrollmentSuccess(user, e.getCourse(), magicLink, isNew));
        }
        return enrollments;
    }

    // ==================== Private helpers ====================

    /**
     * Generates (or reuses) a magic link token for the given user, but only if the user has
     * never explicitly set a password (i.e., magicLinkToken is null or they're a fresh guest).
     * For existing accounts that already have a real password, we skip the magic link and send
     * the standard enrollment email.
     */
    private void sendEnrollmentEmailWithMagicLink(User user, Course course) {
        if (user.getPassword() == null) {
            // Passwordless guest/anonymous account — always send magic link regardless of account age
            boolean isNew = isFreshGuestAccount(user);
            String token = userService.generateMagicLinkToken(user);
            String magicLink = frontendUrl + "/magic-login?token=" + token;
            mailService.sendGuestEnrollmentSuccess(user, course, magicLink, isNew);
        } else {
            // Existing user with a real password — send standard enrollment email
            mailService.sendEnrollmentSuccess(user, course);
        }
    }

    /**
     * Enrolls the guest user in all courses linked to the flagship program,
     * then sends the appropriate enrollment email with a magic link.
     */
    private void enrollInFlagshipCoursesForGuest(User user, FlagshipProgram program) {
        List<String> courseTitles = enrollmentService.enrollInFlagshipLinkedCourses(user, program);
        if (user.getPassword() == null) {
            // Passwordless guest/anonymous account — always send magic link regardless of account age
            boolean isNew = isFreshGuestAccount(user);
            String token = userService.generateMagicLinkToken(user);
            String magicLink = frontendUrl + "/magic-login?token=" + token;
            if (courseTitles.isEmpty()) {
                mailService.sendGuestEnrollmentSuccess(user, program, magicLink, isNew);
            } else {
                mailService.sendGuestBundleEnrollmentSuccess(user, program.getTitle(), courseTitles, magicLink, isNew);
            }
        } else {
            // Existing user with a real password — send standard email
            if (courseTitles.isEmpty()) {
                mailService.sendEnrollmentSuccess(user, program);
            } else {
                mailService.sendBundleEnrollmentSuccess(user.getEmail(),
                        user.getName() != null ? user.getName() : user.getEmail(),
                        program.getTitle(), courseTitles);
            }
        }
    }

    /**
     * A "fresh guest account" is one created via guest enrollment that has never had a password
     * explicitly set. We detect this by checking if createdAt is recent AND magicLinkToken is null
     * (meaning it was just created in this transaction, before generateMagicLinkToken was called).
     * This covers the case right after findOrCreateGuestUser creates a brand-new account.
     */
    /**
     * Derives a display name from an email address.
     * e.g. "john.doe123@gmail.com" → "John Doe123"
     */
    private static String deriveNameFromEmail(String email) {
        if (email == null || email.isBlank()) return "Student";
        String local = email.contains("@") ? email.split("@")[0] : email;
        String[] parts = local.split("[._\\-+]");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (part.isBlank()) continue;
            if (sb.length() > 0) sb.append(' ');
            sb.append(Character.toUpperCase(part.charAt(0)));
            if (part.length() > 1) sb.append(part.substring(1));
        }
        return sb.length() > 0 ? sb.toString() : "Student";
    }

    /**
     * Returns true if the given email already has an active enrollment for the specified item.
     * Used as a pre-payment guard on the Payment page so users aren't charged twice.
     */
    @Transactional(readOnly = true)
    public boolean isAlreadyEnrolled(String email, Long courseId, List<Long> bundleIds, Long flagshipProgramId) {
        Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
        if (userOpt.isEmpty()) return false;
        User user = userOpt.get();
        List<Enrollment.Status> active = List.of(Enrollment.Status.ENROLLED, Enrollment.Status.COMPLETED);

        if (flagshipProgramId != null) {
            FlagshipProgram program = flagshipProgramRepo.findById(flagshipProgramId).orElse(null);
            return program != null && enrollmentRepo.existsByUserAndFlagshipProgramAndStatusIn(user, program, active);
        }
        if (bundleIds != null && !bundleIds.isEmpty()) {
            return enrollmentRepo.existsByUserAndBundle_IdInAndStatusIn(user, bundleIds, active);
        }
        if (courseId != null) {
            Course course = courseRepo.findById(courseId).orElse(null);
            return course != null && enrollmentRepo.existsByUserAndCourseAndStatusIn(user, course, active);
        }
        return false;
    }

    private boolean isFreshGuestAccount(User user) {
        return user.getCreatedAt() != null
                && user.getCreatedAt().isAfter(LocalDateTime.now().minusMinutes(5))
                && user.getMagicLinkToken() == null;
    }

    // ==================== Free Enrollment (no payment) ====================

    @Transactional
    public void enrollGuestFreeCourse(String email, Long courseId) {
        User user = userService.findOrCreateGuestUser(deriveNameFromEmail(email), email, null);
        Course course = courseRepo.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found"));

        Optional<Enrollment> existing = enrollmentRepo.findByUserAndCourse(user, course);
        if (existing.isPresent()) {
            Enrollment e = existing.get();
            if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
                return; // idempotent — already enrolled
            }
            e.setStatus(Enrollment.Status.ENROLLED);
            enrollmentRepo.save(e);
        } else {
            Enrollment e = Enrollment.builder()
                    .user(user).course(course)
                    .enrolledAt(LocalDateTime.now())
                    .status(Enrollment.Status.ENROLLED)
                    .build();
            enrollmentRepo.save(e);
        }
        sendEnrollmentEmailWithMagicLink(user, course);
    }

    @Transactional
    public void enrollGuestFlagshipFree(String email, Long programId) {
        User user = userService.findOrCreateGuestUser(deriveNameFromEmail(email), email, null);
        FlagshipProgram program = flagshipProgramRepo.findById(programId)
                .orElseThrow(() -> new EntityNotFoundException("Flagship program not found"));

        Optional<Enrollment> existing = enrollmentRepo.findByUserAndFlagshipProgram(user, program);
        if (existing.isPresent()) {
            Enrollment e = existing.get();
            if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
                return; // idempotent
            }
            e.setStatus(Enrollment.Status.ENROLLED);
            enrollmentRepo.save(e);
        } else {
            Enrollment e = Enrollment.builder()
                    .user(user).flagshipProgram(program)
                    .enrolledAt(LocalDateTime.now())
                    .status(Enrollment.Status.ENROLLED)
                    .build();
            enrollmentRepo.save(e);
        }
        enrollInFlagshipCoursesForGuest(user, program);
    }
}
