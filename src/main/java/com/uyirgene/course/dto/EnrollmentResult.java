package com.uyirgene.course.dto;

import com.uyirgene.course.Enrollment;

public class EnrollmentResult {
    private Enrollment enrollment;
    private RazorpayOrder order;
    private boolean alreadyEnrolled;
    private String message;

    public EnrollmentResult(Enrollment enrollment, RazorpayOrder order) {
        this.enrollment = enrollment;
        this.order = order;
        this.alreadyEnrolled = false;
        this.message = null;
    }

    public EnrollmentResult(Enrollment enrollment, RazorpayOrder order, boolean alreadyEnrolled, String message) {
        this.enrollment = enrollment;
        this.order = order;
        this.alreadyEnrolled = alreadyEnrolled;
        this.message = message;
    }

    public Enrollment getEnrollment() { return enrollment; }
    public RazorpayOrder getOrder() { return order; }
    public boolean isAlreadyEnrolled() { return alreadyEnrolled; }
    public String getMessage() { return message; }

    public static class RazorpayOrder {
        private String orderId;
        private Long amount; // in paise
        private String currency;
        private String keyId;

        public RazorpayOrder() {}

        public RazorpayOrder(String orderId, Long amount, String currency, String keyId) {
            this.orderId = orderId;
            this.amount = amount;
            this.currency = currency;
            this.keyId = keyId;
        }

        public String getOrderId() { return orderId; }
        public Long getAmount() { return amount; }
        public String getCurrency() { return currency; }
        public String getKeyId() { return keyId; }
    }
}
