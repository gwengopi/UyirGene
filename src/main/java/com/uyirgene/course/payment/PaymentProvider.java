package com.uyirgene.course.payment;

import com.uyirgene.course.payment.dto.PaymentContactDetails;
import com.uyirgene.course.payment.dto.PaymentOrder;

public interface PaymentProvider {

    /**
     * Creates a payment order for the specified amount.
     *
     * @param amountPaise Amount in paise (1 rupee = 100 paise)
     * @param receipt Receipt identifier for the order
     * @return PaymentOrder containing order details
     */
    PaymentOrder createOrder(Long amountSmallestUnit, String currency, String receipt);

    /**
     * Verifies the payment signature to ensure authenticity.
     *
     * @param orderId Order ID from payment gateway
     * @param paymentId Payment ID from payment gateway
     * @param signature Signature to verify
     * @return true if signature is valid, false otherwise
     */
    boolean verifySignature(String orderId, String paymentId, String signature);

    /**
     * Get the public key ID for the payment provider.
     *
     * @return The public key ID
     */
    String getKeyId();

    /**
     * Fetches contact details (email, phone, name) for a completed payment.
     * Used in the anonymous guest enrollment flow to obtain the payer's contact info
     * directly from the payment gateway instead of a pre-enrollment form.
     *
     * @param paymentId The payment ID returned by the payment gateway
     * @return Contact details of the payer
     */
    PaymentContactDetails fetchPaymentDetails(String paymentId);

    /**
     * Fetches the receipt string for a given order ID.
     * Used by the webhook to identify anonymous orders (e.g. "anon-course-3")
     * when no enrollment row exists yet at the time of payment.
     *
     * @param orderId The Razorpay order ID
     * @return The receipt string set when the order was created, or null if unavailable
     */
    String fetchOrderReceipt(String orderId);
}
