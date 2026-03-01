package com.uyirgene.course;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.uyirgene.course.dto.CourseBundleDto;
import com.uyirgene.course.dto.EnrollmentResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/bundles")
@RequiredArgsConstructor
public class CourseBundleController {
    private final CourseBundleService bundleService;
    private final CourseBundleRepository bundleRepo;
    private final ObjectMapper objectMapper;

    // ==================== Public Endpoints ====================

    @GetMapping("/by-course/{courseId}")
    @Operation(summary = "Get published bundles that contain a specific course")
    public ResponseEntity<List<CourseBundleDto>> getBundlesByCourse(@PathVariable("courseId") Long courseId) {
        return ResponseEntity.ok(bundleService.getPublishedBundlesByCourse(courseId));
    }

    @GetMapping
    @Operation(summary = "List all published bundles, optionally filtered by category")
    public ResponseEntity<List<CourseBundleDto>> getPublishedBundles(
            @RequestParam(value = "category", required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(bundleService.getPublishedBundlesByCategory(category));
        }
        return ResponseEntity.ok(bundleService.getPublishedBundles());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get bundle detail")
    public ResponseEntity<CourseBundleDto> getBundleById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(bundleService.getBundleById(id));
    }

    @GetMapping("/{id}/thumbnail")
    @Operation(summary = "Get bundle thumbnail image")
    public ResponseEntity<byte[]> getThumbnailImage(@PathVariable("id") Long id) {
        return bundleRepo.findById(id).map(bundle -> {
            if (bundle.getThumbnailImage() == null || bundle.getThumbnailImage().length == 0) {
                return ResponseEntity.notFound().<byte[]>build();
            }
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                    bundle.getThumbnailImageContentType() != null ? bundle.getThumbnailImageContentType() : "image/jpeg"));
            headers.setContentLength(bundle.getThumbnailImage().length);
            headers.setCacheControl("public, max-age=3600");
            return new ResponseEntity<>(bundle.getThumbnailImage(), headers, HttpStatus.OK);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ==================== Enrollment Endpoints ====================

    @PostMapping("/{id}/enroll")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Start bundle enrollment")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Payment order created"),
            @ApiResponse(responseCode = "400", description = "Already owns all courses"),
            @ApiResponse(responseCode = "404", description = "Bundle not found")
    })
    public ResponseEntity<?> enrollBundle(@PathVariable("id") Long id,
                                           @RequestBody(required = false) EnrollRequest enrollRequest) {
        String countryCode = (enrollRequest != null) ? enrollRequest.getCountryCode() : null;
        CourseBundleService.BundleEnrollmentResult result = bundleService.startBundleEnrollment(id, countryCode);

        if (result.allOwned()) {
            return ResponseEntity.ok(new BundleEnrollmentResponse(
                    null, null, null, result.message(), true));
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(new BundleEnrollmentResponse(
                result.order(), result.alreadyOwnedCourses(), result.newCourses(), result.message(), false));
    }

    @PostMapping("/{id}/enroll/confirm")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Confirm bundle payment")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Payment confirmed, enrolled in all courses"),
            @ApiResponse(responseCode = "400", description = "Invalid payment signature"),
            @ApiResponse(responseCode = "404", description = "Bundle not found")
    })
    public ResponseEntity<?> confirmBundleEnrollment(@PathVariable("id") Long id,
                                                      @Valid @RequestBody PaymentConfirmDto dto) {
        List<Enrollment> enrollments = bundleService.confirmBundlePayment(
                id, dto.getRazorpayPaymentId(), dto.getRazorpayOrderId(), dto.getRazorpaySignature());

        List<String> enrolledCourses = enrollments.stream()
                .map(e -> e.getCourse().getTitle())
                .toList();

        return ResponseEntity.ok(Map.of(
                "message", "Payment confirmed. Enrolled in " + enrollments.size() + " course(s).",
                "enrolledCourses", enrolledCourses
        ));
    }

    @PostMapping("/enroll/multi")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Start multi-bundle enrollment — creates a single Razorpay order for all selected bundles")
    public ResponseEntity<?> enrollMultiBundles(@RequestBody MultiEnrollRequest request) {
        CourseBundleService.MultiEnrollmentResult result =
                bundleService.startMultiBundleEnrollment(request.getBundleIds(), request.getCountryCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/enroll/multi/confirm")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Confirm multi-bundle payment and enroll user in all selected bundles")
    public ResponseEntity<?> confirmMultiBundleEnrollment(@Valid @RequestBody MultiEnrollConfirmDto dto) {
        List<Enrollment> enrollments = bundleService.confirmMultiBundlePayment(
                dto.getBundleIds(), dto.getRazorpayPaymentId(),
                dto.getRazorpayOrderId(), dto.getRazorpaySignature());

        List<String> enrolledCourses = enrollments.stream()
                .map(e -> e.getCourse().getTitle())
                .toList();

        return ResponseEntity.ok(Map.of(
                "message", "Payment confirmed. Enrolled in " + enrollments.size() + " course(s).",
                "enrolledCourses", enrolledCourses
        ));
    }

    // ==================== Admin Endpoints ====================

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all bundles (admin)")
    public ResponseEntity<List<CourseBundleDto>> getAllBundles() {
        return ResponseEntity.ok(bundleService.getAllBundles());
    }

    @PostMapping(value = "/admin", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a bundle")
    public ResponseEntity<CourseBundleDto> createBundle(
            @RequestParam("bundleCode") String bundleCode,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") Double price,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam("courseIds") String courseIdsJson,
            @RequestParam(value = "countryPrices", required = false) String countryPricesJson,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage
    ) throws IOException {
        List<Long> courseIds = objectMapper.readValue(courseIdsJson, new TypeReference<>() {});

        List<Map<String, Object>> countryPrices = null;
        if (countryPricesJson != null && !countryPricesJson.isBlank()) {
            countryPrices = objectMapper.readValue(countryPricesJson, new TypeReference<>() {});
        }

        byte[] imageBytes = null;
        String imageContentType = null;
        if (thumbnailImage != null && !thumbnailImage.isEmpty()) {
            String err = validateImage(thumbnailImage);
            if (err != null) {
                return ResponseEntity.badRequest().body(null);
            }
            imageBytes = thumbnailImage.getBytes();
            imageContentType = thumbnailImage.getContentType();
        }

        CourseBundleDto result = bundleService.createBundle(
                bundleCode, title, description, price, displayOrder, category, courseIds,
                countryPrices, imageBytes, imageContentType);

        return ResponseEntity.created(URI.create("/api/bundles/" + result.getId())).body(result);
    }

    @PutMapping(value = "/admin/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a bundle")
    public ResponseEntity<CourseBundleDto> updateBundle(
            @PathVariable("id") Long id,
            @RequestParam("bundleCode") String bundleCode,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") Double price,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam("courseIds") String courseIdsJson,
            @RequestParam(value = "countryPrices", required = false) String countryPricesJson,
            @RequestParam(value = "thumbnailImage", required = false) MultipartFile thumbnailImage,
            @RequestParam(value = "removeThumbnailImage", defaultValue = "false") Boolean removeThumbnailImage
    ) throws IOException {
        List<Long> courseIds = objectMapper.readValue(courseIdsJson, new TypeReference<>() {});

        List<Map<String, Object>> countryPrices = null;
        if (countryPricesJson != null && !countryPricesJson.isBlank()) {
            countryPrices = objectMapper.readValue(countryPricesJson, new TypeReference<>() {});
        }

        byte[] imageBytes = null;
        String imageContentType = null;
        if (thumbnailImage != null && !thumbnailImage.isEmpty()) {
            String err = validateImage(thumbnailImage);
            if (err != null) {
                return ResponseEntity.badRequest().body(null);
            }
            imageBytes = thumbnailImage.getBytes();
            imageContentType = thumbnailImage.getContentType();
        }

        CourseBundleDto result = bundleService.updateBundle(
                id, bundleCode, title, description, price, displayOrder, category, courseIds,
                countryPrices, imageBytes, imageContentType, removeThumbnailImage);

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a bundle")
    public ResponseEntity<?> deleteBundle(@PathVariable("id") Long id) {
        bundleService.deleteBundle(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle bundle publish status")
    public ResponseEntity<CourseBundleDto> togglePublish(@PathVariable("id") Long id) {
        return ResponseEntity.ok(bundleService.togglePublish(id));
    }

    // ==================== DTOs ====================

    @Data
    public static class EnrollRequest {
        private String countryCode;
    }

    @Data
    public static class MultiEnrollRequest {
        private List<Long> bundleIds;
        private String countryCode;
    }

    @Data
    public static class MultiEnrollConfirmDto {
        @NotBlank(message = "Payment ID is required")
        private String razorpayPaymentId;
        @NotBlank(message = "Order ID is required")
        private String razorpayOrderId;
        @NotBlank(message = "Signature is required")
        private String razorpaySignature;
        private List<Long> bundleIds;
    }

    public static class PaymentConfirmDto {
        @NotBlank(message = "Payment ID is required")
        private String razorpayPaymentId;

        @NotBlank(message = "Order ID is required")
        private String razorpayOrderId;

        @NotBlank(message = "Signature is required")
        private String razorpaySignature;

        public String getRazorpayPaymentId() { return razorpayPaymentId; }
        public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
        public String getRazorpayOrderId() { return razorpayOrderId; }
        public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
        public String getRazorpaySignature() { return razorpaySignature; }
        public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
    }

    @Data
    @AllArgsConstructor
    public static class BundleEnrollmentResponse {
        private EnrollmentResult.RazorpayOrder order;
        private List<String> alreadyOwnedCourses;
        private List<String> newCourses;
        private String message;
        private boolean allOwned;
    }

    // ==================== Helpers ====================

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/gif", "image/webp");

    private String validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) return null;
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            return "Invalid image type. Allowed: JPEG, PNG, GIF, WebP";
        }
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[4];
            if (is.read(header) < 4) return "File too small to be a valid image";
            boolean valid = (header[0] == (byte) 0xFF && header[1] == (byte) 0xD8) ||
                    (header[0] == (byte) 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) ||
                    (header[0] == 0x47 && header[1] == 0x49 && header[2] == 0x46) ||
                    (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46);
            if (!valid) return "File content does not match a valid image format";
        } catch (IOException e) {
            return "Could not read image file";
        }
        return null;
    }
}
