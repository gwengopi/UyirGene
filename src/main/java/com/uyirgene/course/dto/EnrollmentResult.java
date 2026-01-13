package com.uyirgene.course.dto;

import com.uyirgene.course.Enrollment;

public class EnrollmentResult {
    private Enrollment enrollment;
    private RazorpayOrder order;

    public EnrollmentResult(Enrollment enrollment, RazorpayOrder order) {
        this.enrollment = enrollment;
        this.order = order;
    }

    public Enrollment getEnrollment() { return enrollment; }
    public RazorpayOrder getOrder() { return order; }

    public static class RazorpayOrder {
        private String orderId;
        private Integer amount; // in paise
        private String currency;
        private String keyId;

        public RazorpayOrder() {}

        public RazorpayOrder(String orderId, Integer amount, String currency, String keyId) {
            this.orderId = orderId;
            this.amount = amount;
            this.currency = currency;
            this.keyId = keyId;
        }

        public String getOrderId() { return orderId; }
        public Integer getAmount() { return amount; }
        public String getCurrency() { return currency; }
        public String getKeyId() { return keyId; }
    }
}
