package com.uyirgene.course.payment;

import com.uyirgene.course.payment.dto.PaymentOrder;

public interface PaymentProvider {

    /**
     * Creates a payment order for the specified amount.
     *
     * @param amountPaise Amount in paise (1 rupee = 100 paise)
     * @param receipt Receipt identifier for the order
     * @return PaymentOrder containing order details
     */
    PaymentOrder createOrder(Long amountPaise, String receipt);

    /**
     * Verifies the payment signature to ensure authenticity.
     *
     * @param orderId Order ID from payment gateway
     * @param paymentId Payment ID from payment gateway
     * @param signature Signature to verify
     * @return true if signature is valid, false otherwise
     */
    boolean verifySignature(String orderId, String paymentId, String signature);
}
