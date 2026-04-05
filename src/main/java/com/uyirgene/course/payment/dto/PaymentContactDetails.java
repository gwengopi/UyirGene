package com.uyirgene.course.payment.dto;

/**
 * Contact details returned from Razorpay's fetch-payment API.
 * Used in the anonymous guest enrollment flow where the user fills
 * their details inside the Razorpay checkout rather than a separate modal.
 */
public record PaymentContactDetails(
        String email,
        String contact,   // phone number as entered in Razorpay
        String name,      // may be null (card-holder name, not always present)
        Long amount,      // in smallest currency unit (paise)
        String currency
) {}
