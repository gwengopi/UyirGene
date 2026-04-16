package com.uyirgene.course;

import com.uyirgene.course.dto.CourseBundleDto;
import com.uyirgene.course.dto.EnrollmentResult;
import com.uyirgene.course.payment.PaymentProvider;
import com.uyirgene.course.payment.dto.PaymentOrder;
import com.uyirgene.exception.EntityNotFoundException;
import com.uyirgene.exception.PaymentException;
import com.uyirgene.user.CurrentUserService;
import com.uyirgene.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseBundleService {
    private final CourseBundleRepository bundleRepo;
    private final BundlePriceRepository bundlePriceRepo;
    private final CourseRepository courseRepo;
    private final CoursePriceRepository coursePriceRepo;
    private final EnrollmentRepository enrollmentRepo;
    private final CurrentUserService currentUserService;
    private final PaymentProvider paymentProvider;
    private final MailService mailService;

    // ==================== Public ====================

    @Transactional(readOnly = true)
    public List<CourseBundleDto> getPublishedBundlesByCourse(Long courseId) {
        return bundleRepo.findPublishedBundlesByCourseId(courseId).stream()
                .map(CourseBundleDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseBundleDto> getPublishedBundles() {
        return bundleRepo.findByPublishedTrueOrderByDisplayOrderAscIdAsc().stream()
                .map(CourseBundleDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseBundleDto> getPublishedBundlesByCategory(String category) {
        return bundleRepo.findByPublishedTrueAndCategoryOrderByDisplayOrderAscIdAsc(category).stream()
                .map(CourseBundleDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseBundleDto> getPublishedBundlesByCourseCategory(String category) {
        return bundleRepo.findPublishedBundlesByCourseCategory(category).stream()
                .map(CourseBundleDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseBundleDto getBundleById(Long id) {
        CourseBundle bundle = bundleRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bundle not found"));
        return CourseBundleDto.fromEntity(bundle);
    }

    @Transactional(readOnly = true)
    public CourseBundleDto getBundleBySlug(String slug) {
        CourseBundle bundle = bundleRepo.findBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Bundle not found"));
        return CourseBundleDto.fromEntity(bundle);
    }

    private String generateUniqueSlug(String title, Long excludeId) {
        String base = title.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        if (base.isEmpty()) base = "bundle";
        String candidate = base;
        int suffix = 2;
        while (excludeId != null
                ? bundleRepo.existsBySlugAndIdNot(candidate, excludeId)
                : bundleRepo.existsBySlug(candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    // ==================== Admin CRUD ====================

    @Transactional(readOnly = true)
    public List<CourseBundleDto> getAllBundles() {
        return bundleRepo.findAllByOrderByDisplayOrderAscIdAsc().stream()
                .map(CourseBundleDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseBundleDto createBundle(String bundleCode, String title, String description,
                                        Double price, Integer displayOrder, String category,
                                        List<Long> courseIds,
                                        List<Map<String, Object>> countryPrices,
                                        byte[] thumbnailImage, String thumbnailImageContentType) {
        List<Course> courses = courseRepo.findAllById(courseIds);
        if (courses.size() != courseIds.size()) {
            throw new IllegalArgumentException("One or more course IDs are invalid");
        }

        // Calculate original price from individual course prices
        Double originalPrice = courses.stream()
                .map(Course::getPrice)
                .filter(Objects::nonNull)
                .reduce(0.0, Double::sum);

        CourseBundle bundle = CourseBundle.builder()
                .bundleCode(bundleCode)
                .title(title)
                .slug(generateUniqueSlug(title, null))
                .description(description)
                .price(price)
                .originalPrice(originalPrice)
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .category(category)
                .published(false)
                .courses(new ArrayList<>(courses))
                .thumbnailImage(thumbnailImage)
                .thumbnailImageContentType(thumbnailImageContentType)
                .build();

        // Add country prices
        if (countryPrices != null) {
            for (Map<String, Object> entry : countryPrices) {
                String countryCode = (String) entry.get("countryCode");
                String currencyCode = (String) entry.get("currencyCode");
                Object amtObj = entry.get("amount");
                Double amount = amtObj instanceof Number
                        ? ((Number) amtObj).doubleValue()
                        : Double.parseDouble(amtObj.toString());
                if (countryCode != null && currencyCode != null && amount > 0) {
                    BundlePrice bp = BundlePrice.builder()
                            .bundle(bundle)
                            .countryCode(countryCode)
                            .currencyCode(currencyCode)
                            .amount(amount)
                            .build();
                    bundle.getCountryPrices().add(bp);
                }
            }
        }

        CourseBundle saved = bundleRepo.save(bundle);
        return CourseBundleDto.fromEntity(saved);
    }

    @Transactional
    public CourseBundleDto updateBundle(Long id, String bundleCode, String title, String description,
                                        Double price, Integer displayOrder, String category,
                                        List<Long> courseIds,
                                        List<Map<String, Object>> countryPrices,
                                        byte[] thumbnailImage, String thumbnailImageContentType,
                                        boolean removeThumbnailImage) {
        CourseBundle bundle = bundleRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bundle not found"));

        bundle.setBundleCode(bundleCode);
        bundle.setTitle(title);
        bundle.setSlug(generateUniqueSlug(title, id));
        bundle.setDescription(description);
        bundle.setPrice(price);
        bundle.setDisplayOrder(displayOrder != null ? displayOrder : 0);
        bundle.setCategory(category);

        // Update courses
        if (courseIds != null) {
            List<Course> courses = courseRepo.findAllById(courseIds);
            bundle.setCourses(new ArrayList<>(courses));
            // Recalculate original price
            Double originalPrice = courses.stream()
                    .map(Course::getPrice)
                    .filter(Objects::nonNull)
                    .reduce(0.0, Double::sum);
            bundle.setOriginalPrice(originalPrice);
        }

        // Handle thumbnail
        if (removeThumbnailImage) {
            bundle.setThumbnailImage(null);
            bundle.setThumbnailImageContentType(null);
        } else if (thumbnailImage != null) {
            bundle.setThumbnailImage(thumbnailImage);
            bundle.setThumbnailImageContentType(thumbnailImageContentType);
        }

        // Update country prices (in-place merge to avoid Hibernate conflicts)
        if (countryPrices != null) {
            Map<String, Map<String, Object>> newPricesMap = new HashMap<>();
            for (Map<String, Object> entry : countryPrices) {
                String cc = (String) entry.get("countryCode");
                if (cc != null) newPricesMap.put(cc, entry);
            }

            List<BundlePrice> toRemove = new ArrayList<>();
            for (BundlePrice bp : bundle.getCountryPrices()) {
                Map<String, Object> newEntry = newPricesMap.remove(bp.getCountryCode());
                if (newEntry != null) {
                    bp.setCurrencyCode((String) newEntry.get("currencyCode"));
                    Object amtObj = newEntry.get("amount");
                    bp.setAmount(amtObj instanceof Number
                            ? ((Number) amtObj).doubleValue()
                            : Double.parseDouble(amtObj.toString()));
                } else {
                    toRemove.add(bp);
                }
            }
            bundle.getCountryPrices().removeAll(toRemove);

            for (Map<String, Object> entry : newPricesMap.values()) {
                String countryCode = (String) entry.get("countryCode");
                String currencyCode = (String) entry.get("currencyCode");
                Object amtObj = entry.get("amount");
                Double amount = amtObj instanceof Number
                        ? ((Number) amtObj).doubleValue()
                        : Double.parseDouble(amtObj.toString());
                if (countryCode != null && currencyCode != null && amount > 0) {
                    BundlePrice bp = BundlePrice.builder()
                            .bundle(bundle)
                            .countryCode(countryCode)
                            .currencyCode(currencyCode)
                            .amount(amount)
                            .build();
                    bundle.getCountryPrices().add(bp);
                }
            }
        }

        CourseBundle saved = bundleRepo.save(bundle);
        return CourseBundleDto.fromEntity(saved);
    }

    @Transactional
    public void deleteBundle(Long id) {
        CourseBundle bundle = bundleRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bundle not found"));
        bundleRepo.delete(bundle);
    }

    @Transactional
    public CourseBundleDto togglePublish(Long id) {
        CourseBundle bundle = bundleRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bundle not found"));
        bundle.setPublished(!bundle.getPublished());
        CourseBundle saved = bundleRepo.save(bundle);
        return CourseBundleDto.fromEntity(saved);
    }

    // ==================== Bundle Enrollment ====================

    @Transactional
    public BundleEnrollmentResult startBundleEnrollment(Long bundleId, String countryCode) {
        User user = currentUserService.getCurrentUser();
        CourseBundle bundle = bundleRepo.findById(bundleId)
                .orElseThrow(() -> new EntityNotFoundException("Bundle not found"));

        if (!bundle.getPublished()) {
            throw new IllegalStateException("This bundle is not available for purchase");
        }

        // Check which courses the user already owns
        List<Course> allCourses = bundle.getCourses();
        List<Course> alreadyOwned = new ArrayList<>();
        List<Course> newCourses = new ArrayList<>();

        for (Course course : allCourses) {
            Optional<Enrollment> existing = enrollmentRepo.findByUserAndCourse(user, course);
            if (existing.isPresent() &&
                (existing.get().getStatus() == Enrollment.Status.ENROLLED ||
                 existing.get().getStatus() == Enrollment.Status.COMPLETED)) {
                alreadyOwned.add(course);
            } else {
                newCourses.add(course);
            }
        }

        // If user owns ALL courses in the bundle, block purchase
        if (newCourses.isEmpty()) {
            return new BundleEnrollmentResult(null, null, null,
                    "You already own all courses in this bundle", true);
        }

        // Resolve price and currency
        Double resolvedPrice;
        String resolvedCurrency;
        if (countryCode != null && !countryCode.isBlank() && !"IN".equalsIgnoreCase(countryCode)) {
            Optional<BundlePrice> bundlePrice = bundlePriceRepo.findByBundleAndCountryCode(bundle, countryCode.toUpperCase());
            if (bundlePrice.isPresent()) {
                resolvedPrice = bundlePrice.get().getAmount();
                resolvedCurrency = bundlePrice.get().getCurrencyCode();
            } else {
                resolvedPrice = bundle.getPrice();
                resolvedCurrency = "INR";
            }
        } else {
            resolvedPrice = bundle.getPrice();
            resolvedCurrency = "INR";
        }

        // Create Razorpay order
        long amountSmallestUnit = Math.round(resolvedPrice * 100);
        PaymentOrder po = paymentProvider.createOrder(
                amountSmallestUnit, resolvedCurrency, "bundle-" + bundleId + "-" + System.currentTimeMillis());

        EnrollmentResult.RazorpayOrder order = new EnrollmentResult.RazorpayOrder(
                po.getId(), po.getAmount(), po.getCurrency(), po.getKeyId());

        // Build warning message if user already owns some courses
        String message = null;
        if (!alreadyOwned.isEmpty()) {
            String ownedNames = alreadyOwned.stream().map(Course::getTitle).collect(Collectors.joining(", "));
            message = "You already own: " + ownedNames + ". The bundle will give you access to the remaining " +
                      newCourses.size() + " course(s).";
        }

        List<String> alreadyOwnedTitles = alreadyOwned.stream().map(Course::getTitle).collect(Collectors.toList());
        List<String> newCourseTitles = newCourses.stream().map(Course::getTitle).collect(Collectors.toList());

        return new BundleEnrollmentResult(order, alreadyOwnedTitles, newCourseTitles, message, false);
    }

    @Transactional
    public List<Enrollment> confirmBundlePayment(Long bundleId, String razorpayPaymentId,
                                                  String razorpayOrderId, String signature) {
        User user = currentUserService.getCurrentUser();
        CourseBundle bundle = bundleRepo.findById(bundleId)
                .orElseThrow(() -> new EntityNotFoundException("Bundle not found"));

        // Verify payment signature
        boolean ok = paymentProvider.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!ok) {
            throw new PaymentException("Invalid payment signature");
        }

        // Enroll user in each course they don't already own
        List<Enrollment> newEnrollments = new ArrayList<>();
        for (Course course : bundle.getCourses()) {
            Optional<Enrollment> existing = enrollmentRepo.findByUserAndCourse(user, course);
            if (existing.isPresent()) {
                Enrollment e = existing.get();
                if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
                    continue; // Already enrolled, skip
                }
                // Update PENDING/UNENROLLED enrollment
                e.setStatus(Enrollment.Status.ENROLLED);
                e.setBundle(bundle);
                e.setPaymentOrderId(razorpayOrderId);
                e.setUnenrolledAt(null); // clear if re-enrolling after unenroll
                newEnrollments.add(enrollmentRepo.save(e));
            } else {
                Enrollment enrollment = Enrollment.builder()
                        .user(user)
                        .course(course)
                        .bundle(bundle)
                        .enrolledAt(LocalDateTime.now())
                        .status(Enrollment.Status.ENROLLED)
                        .paymentOrderId(razorpayOrderId)
                        .build();
                newEnrollments.add(enrollmentRepo.save(enrollment));
            }
        }

        // Eagerly resolve all data before transaction closes (for @Async mail)
        String userEmail = user.getEmail();
        String userName = user.getName();
        String bundleTitle = bundle.getTitle();
        List<String> enrolledCourseTitles = newEnrollments.stream()
                .map(e -> e.getCourse().getTitle())
                .toList();

        // Send confirmation email with all enrolled courses
        if (!newEnrollments.isEmpty()) {
            mailService.sendBundleEnrollmentSuccess(userEmail, userName, bundleTitle, enrolledCourseTitles);
        }

        return newEnrollments;
    }

    // ==================== Multi-Bundle Enrollment ====================

    @Transactional
    public MultiEnrollmentResult startMultiBundleEnrollment(List<Long> bundleIds, String countryCode, Long standaloneCourseId) {
        return startMultiBundleEnrollmentForUser(currentUserService.getCurrentUser(), bundleIds, countryCode, standaloneCourseId);
    }

    @Transactional
    public MultiEnrollmentResult startGuestMultiBundleEnrollment(User user, List<Long> bundleIds, String countryCode, Long standaloneCourseId) {
        return startMultiBundleEnrollmentForUser(user, bundleIds, countryCode, standaloneCourseId);
    }

    /**
     * Creates a Razorpay order for an anonymous (no-account) multi-bundle enrollment.
     * No user is associated yet — the user is created on payment confirmation.
     */
    public MultiEnrollmentResult createAnonymousBundleOrder(List<Long> bundleIds, String countryCode, Long standaloneCourseId) {
        boolean useCountryPricing = countryCode != null && !countryCode.isBlank() && !"IN".equalsIgnoreCase(countryCode);
        String upperCC = useCountryPricing ? countryCode.toUpperCase() : null;

        List<Double> amounts = new ArrayList<>();
        List<String> currencies = new ArrayList<>();

        for (Long bundleId : bundleIds) {
            CourseBundle bundle = bundleRepo.findById(bundleId)
                    .orElseThrow(() -> new EntityNotFoundException("Bundle not found: " + bundleId));
            if (!bundle.getPublished())
                throw new IllegalStateException("Bundle '" + bundle.getTitle() + "' is not available for purchase");
            if (useCountryPricing) {
                Optional<BundlePrice> bp = bundlePriceRepo.findByBundleAndCountryCode(bundle, upperCC);
                amounts.add(bp.map(BundlePrice::getAmount).orElse(bundle.getPrice()));
                currencies.add(bp.map(BundlePrice::getCurrencyCode).orElse("INR"));
            } else {
                amounts.add(bundle.getPrice());
                currencies.add("INR");
            }
        }

        // Normalise currencies (if mixed, fall back to INR)
        String finalCurrency = currencies.stream().allMatch(c -> c.equals(currencies.get(0))) ? currencies.get(0) : "INR";
        double totalAmount = amounts.stream().mapToDouble(Double::doubleValue).sum();

        // Standalone course price
        if (standaloneCourseId != null) {
            Course sc = courseRepo.findById(standaloneCourseId)
                    .orElseThrow(() -> new EntityNotFoundException("Course not found: " + standaloneCourseId));
            if (useCountryPricing) {
                Optional<CoursePrice> cp = coursePriceRepo.findByCourseAndCountryCode(sc, upperCC);
                if (cp.isPresent()) {
                    totalAmount += cp.get().getAmount();
                } else {
                    totalAmount += sc.getPrice();
                }
            } else {
                totalAmount += sc.getPrice();
            }
        }

        long amountSmallestUnit = Math.round(totalAmount * 100);
        PaymentOrder po = paymentProvider.createOrder(amountSmallestUnit, finalCurrency, "anon-bundles-" + System.currentTimeMillis());
        return new MultiEnrollmentResult(
                new EnrollmentResult.RazorpayOrder(po.getId(), po.getAmount(), po.getCurrency(), po.getKeyId()),
                null);
    }

    @Transactional
    private MultiEnrollmentResult startMultiBundleEnrollmentForUser(User user, List<Long> bundleIds, String countryCode, Long standaloneCourseId) {
        List<String> warnings = new ArrayList<>();

        boolean useCountryPricing = countryCode != null && !countryCode.isBlank() && !"IN".equalsIgnoreCase(countryCode);
        String upperCC = useCountryPricing ? countryCode.toUpperCase() : null;

        // Collect loaded bundles and their resolved (price, currency) for two-pass normalization
        List<CourseBundle> loadedBundles = new ArrayList<>();
        List<Double> resolvedAmounts = new ArrayList<>();
        List<String> resolvedCurrencies = new ArrayList<>();

        for (Long bundleId : bundleIds) {
            CourseBundle bundle = bundleRepo.findById(bundleId)
                    .orElseThrow(() -> new EntityNotFoundException("Bundle not found: " + bundleId));
            if (!bundle.getPublished()) {
                throw new IllegalStateException("Bundle '" + bundle.getTitle() + "' is not available for purchase");
            }

            // Build ownership warning
            List<Course> alreadyOwned = new ArrayList<>();
            for (Course course : bundle.getCourses()) {
                Optional<Enrollment> existing = enrollmentRepo.findByUserAndCourse(user, course);
                if (existing.isPresent() &&
                        (existing.get().getStatus() == Enrollment.Status.ENROLLED ||
                         existing.get().getStatus() == Enrollment.Status.COMPLETED)) {
                    alreadyOwned.add(course);
                }
            }
            if (!alreadyOwned.isEmpty() && alreadyOwned.size() < bundle.getCourses().size()) {
                String names = alreadyOwned.stream().map(Course::getTitle).collect(Collectors.joining(", "));
                warnings.add("\"" + bundle.getTitle() + "\": you already own " + names);
            }

            // Resolve bundle price
            double price;
            String currency;
            if (useCountryPricing) {
                Optional<BundlePrice> bp = bundlePriceRepo.findByBundleAndCountryCode(bundle, upperCC);
                price = bp.map(BundlePrice::getAmount).orElse(bundle.getPrice());
                currency = bp.map(BundlePrice::getCurrencyCode).orElse("INR");
            } else {
                price = bundle.getPrice();
                currency = "INR";
            }

            loadedBundles.add(bundle);
            resolvedAmounts.add(price);
            resolvedCurrencies.add(currency);
        }

        // Resolve standalone course price (if provided and not already owned)
        Course standalone = null;
        boolean standaloneAlreadyOwned = true;
        double standaloneAmount = 0.0;
        String standaloneCurrency = "INR";

        if (standaloneCourseId != null) {
            standalone = courseRepo.findById(standaloneCourseId)
                    .orElseThrow(() -> new EntityNotFoundException("Course not found: " + standaloneCourseId));
            Optional<Enrollment> existing = enrollmentRepo.findByUserAndCourse(user, standalone);
            standaloneAlreadyOwned = existing.isPresent() &&
                    (existing.get().getStatus() == Enrollment.Status.ENROLLED ||
                     existing.get().getStatus() == Enrollment.Status.COMPLETED);
            if (!standaloneAlreadyOwned) {
                if (useCountryPricing) {
                    Optional<CoursePrice> cp = coursePriceRepo.findByCourseAndCountryCode(standalone, upperCC);
                    standaloneAmount = cp.map(CoursePrice::getAmount)
                            .orElse(standalone.getPrice() != null ? standalone.getPrice() : 0.0);
                    standaloneCurrency = cp.map(CoursePrice::getCurrencyCode).orElse("INR");
                } else {
                    standaloneAmount = standalone.getPrice() != null ? standalone.getPrice() : 0.0;
                    standaloneCurrency = "INR";
                }
                resolvedCurrencies.add(standaloneCurrency);
            }
        }

        // Determine effective currency:
        // Priority: (1) standalone course's resolved currency (the currency the user was
        // browsing in when they clicked Enroll), (2) first non-INR bundle currency,
        // (3) INR as final fallback.
        // Bundles that had no country-specific price and fell back to INR will be charged
        // at their base price amount but in the effective currency — consistent with what
        // the frontend dialog displays.
        String effectiveCurrency = "INR";
        if (standalone != null && !standaloneAlreadyOwned && !"INR".equals(standaloneCurrency)) {
            effectiveCurrency = standaloneCurrency;
        } else {
            for (String c : resolvedCurrencies) {
                if (!"INR".equals(c)) { effectiveCurrency = c; break; }
            }
        }

        // Compute total in effective currency.
        // For items whose resolved currency differs from the effective one, use the INR base price.
        double totalAmount = 0.0;
        for (int i = 0; i < loadedBundles.size(); i++) {
            if (resolvedCurrencies.get(i).equals(effectiveCurrency)) {
                totalAmount += resolvedAmounts.get(i);
            } else {
                totalAmount += loadedBundles.get(i).getPrice(); // INR base price
            }
        }
        if (standalone != null && !standaloneAlreadyOwned) {
            if (standaloneCurrency.equals(effectiveCurrency)) {
                totalAmount += standaloneAmount;
            } else {
                totalAmount += standalone.getPrice() != null ? standalone.getPrice() : 0.0;
            }
        }

        long amountSmallestUnit = Math.round(totalAmount * 100);
        PaymentOrder po = paymentProvider.createOrder(
                amountSmallestUnit, effectiveCurrency, "multi-bundle-" + System.currentTimeMillis());

        EnrollmentResult.RazorpayOrder order = new EnrollmentResult.RazorpayOrder(
                po.getId(), po.getAmount(), po.getCurrency(), po.getKeyId());

        String warningMessage = warnings.isEmpty() ? null : "Note: " + String.join("; ", warnings);
        return new MultiEnrollmentResult(order, warningMessage);
    }

    @Transactional
    public List<Enrollment> confirmMultiBundlePayment(List<Long> bundleIds, String razorpayPaymentId,
                                                       String razorpayOrderId, String signature,
                                                       Long standaloneCourseId) {
        boolean ok = paymentProvider.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!ok) throw new PaymentException("Invalid payment signature");
        return confirmMultiBundlePaymentForUser(currentUserService.getCurrentUser(), bundleIds, razorpayPaymentId, razorpayOrderId, standaloneCourseId, false);
    }

    @Transactional
    public List<Enrollment> confirmGuestMultiBundlePayment(User user, List<Long> bundleIds, String razorpayPaymentId,
                                                            String razorpayOrderId, String signature,
                                                            Long standaloneCourseId) {
        boolean ok = paymentProvider.verifySignature(razorpayOrderId, razorpayPaymentId, signature);
        if (!ok) throw new PaymentException("Invalid payment signature");
        return confirmMultiBundlePaymentForUser(user, bundleIds, razorpayPaymentId, razorpayOrderId, standaloneCourseId, true);
    }

    @Transactional
    private List<Enrollment> confirmMultiBundlePaymentForUser(User user, List<Long> bundleIds, String razorpayPaymentId,
                                                               String razorpayOrderId,
                                                               Long standaloneCourseId, boolean suppressEmail) {
        List<Enrollment> allEnrollments = new ArrayList<>();

        for (Long bundleId : bundleIds) {
            CourseBundle bundle = bundleRepo.findById(bundleId)
                    .orElseThrow(() -> new EntityNotFoundException("Bundle not found: " + bundleId));

            List<Enrollment> newEnrollments = new ArrayList<>();
            for (Course course : bundle.getCourses()) {
                Optional<Enrollment> existing = enrollmentRepo.findByUserAndCourse(user, course);
                if (existing.isPresent()) {
                    Enrollment e = existing.get();
                    if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
                        continue;
                    }
                    e.setStatus(Enrollment.Status.ENROLLED);
                    e.setBundle(bundle);
                    e.setPaymentOrderId(razorpayOrderId);
                    e.setUnenrolledAt(null); // clear if re-enrolling after unenroll
                    newEnrollments.add(enrollmentRepo.save(e));
                } else {
                    Enrollment enrollment = Enrollment.builder()
                            .user(user)
                            .course(course)
                            .bundle(bundle)
                            .enrolledAt(LocalDateTime.now())
                            .status(Enrollment.Status.ENROLLED)
                            .paymentOrderId(razorpayOrderId)
                            .build();
                    newEnrollments.add(enrollmentRepo.save(enrollment));
                }
            }

            if (!newEnrollments.isEmpty() && !suppressEmail) {
                String userEmail = user.getEmail();
                String userName = user.getName();
                String bundleTitle = bundle.getTitle();
                List<String> courseTitles = newEnrollments.stream()
                        .map(e -> e.getCourse().getTitle()).toList();
                mailService.sendBundleEnrollmentSuccess(userEmail, userName, bundleTitle, courseTitles);
            }

            allEnrollments.addAll(newEnrollments);
        }

        // Also enroll in the standalone course that was part of this combined payment
        if (standaloneCourseId != null) {
            Course standalone = courseRepo.findById(standaloneCourseId)
                    .orElseThrow(() -> new EntityNotFoundException("Course not found: " + standaloneCourseId));
            Optional<Enrollment> existing = enrollmentRepo.findByUserAndCourse(user, standalone);
            boolean alreadyEnrolled = existing.isPresent() &&
                    (existing.get().getStatus() == Enrollment.Status.ENROLLED ||
                     existing.get().getStatus() == Enrollment.Status.COMPLETED);
            if (!alreadyEnrolled) {
                Enrollment standaloneEnrollment;
                if (existing.isPresent()) {
                    Enrollment e = existing.get();
                    e.setStatus(Enrollment.Status.ENROLLED);
                    e.setPaymentOrderId(razorpayOrderId);
                    e.setUnenrolledAt(null); // clear if re-enrolling after unenroll
                    standaloneEnrollment = enrollmentRepo.save(e);
                } else {
                    standaloneEnrollment = enrollmentRepo.save(Enrollment.builder()
                            .user(user)
                            .course(standalone)
                            .enrolledAt(LocalDateTime.now())
                            .status(Enrollment.Status.ENROLLED)
                            .paymentOrderId(razorpayOrderId)
                            .build());
                }
                allEnrollments.add(standaloneEnrollment);
                // Send individual enrollment confirmation email for the standalone course
                if (!suppressEmail) {
                    mailService.sendEnrollmentSuccess(user, standalone);
                }
            }
        }

        return allEnrollments;
    }

    // ==================== Admin Grant Bundle Access ====================

    @Transactional
    public List<Enrollment> grantBundleEnrollment(User user, Long bundleId) {
        CourseBundle bundle = bundleRepo.findById(bundleId)
                .orElseThrow(() -> new EntityNotFoundException("Bundle not found"));

        List<Enrollment> newEnrollments = new ArrayList<>();
        for (Course course : bundle.getCourses()) {
            Optional<Enrollment> existing = enrollmentRepo.findByUserAndCourse(user, course);
            if (existing.isPresent()) {
                Enrollment e = existing.get();
                if (e.getStatus() == Enrollment.Status.ENROLLED || e.getStatus() == Enrollment.Status.COMPLETED) {
                    continue; // already enrolled, skip
                }
                e.setStatus(Enrollment.Status.ENROLLED);
                e.setBundle(bundle);
                e.setEnrolledAt(LocalDateTime.now());
                e.setUnenrolledAt(null); // clear if re-enrolling after unenroll
                newEnrollments.add(enrollmentRepo.save(e));
            } else {
                Enrollment enrollment = Enrollment.builder()
                        .user(user)
                        .course(course)
                        .bundle(bundle)
                        .enrolledAt(LocalDateTime.now())
                        .status(Enrollment.Status.ENROLLED)
                        .build();
                newEnrollments.add(enrollmentRepo.save(enrollment));
            }
        }

        if (!newEnrollments.isEmpty()) {
            List<String> courseTitles = bundle.getCourses().stream().map(Course::getTitle).toList();
            mailService.sendBundleEnrollmentSuccess(user.getEmail(),
                    user.getName() != null ? user.getName() : user.getEmail(),
                    bundle.getTitle(), courseTitles);
        }

        return newEnrollments;
    }

    // ==================== Result DTOs ====================

    public record BundleEnrollmentResult(
            EnrollmentResult.RazorpayOrder order,
            List<String> alreadyOwnedCourses,
            List<String> newCourses,
            String message,
            boolean allOwned
    ) {}

    public record MultiEnrollmentResult(
            EnrollmentResult.RazorpayOrder order,
            String message
    ) {}
}
