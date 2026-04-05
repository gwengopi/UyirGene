package com.uyirgene.course.payment;

import com.uyirgene.course.payment.dto.PaymentContactDetails;
import com.uyirgene.course.payment.dto.PaymentOrder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@Profile("test")
@Slf4j
public class MockPaymentService implements PaymentProvider {

    @Value("${payment.mock.delay-ms:2000}")
    private long delayMs;

    private static final Random random = new Random();

    @Override
    public PaymentOrder createOrder(Long amountSmallestUnit, String currency, String receipt) {
        log.info("Creating mock payment order for amount: {} {}, receipt: {}", amountSmallestUnit, currency, receipt);

        // Simulate payment processing delay
        try {
            Thread.sleep(delayMs);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Mock payment delay interrupted", e);
        }

        // Generate mock order ID
        String orderId = String.format("order_mock_%d_%d",
            System.currentTimeMillis(),
            random.nextInt(100000));

        log.info("Mock order created successfully: {}", orderId);

        return new PaymentOrder(
            orderId,
            amountSmallestUnit,
            currency,
            "mock_key_id"
        );
    }

    @Override
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        log.info("Verifying mock payment signature for orderId: {}, paymentId: {}", orderId, paymentId);

        // In mock mode, always return true for verification
        log.info("Mock signature verification successful (always returns true in mock mode)");

        return true;
    }

    @Override
    public String getKeyId() {
        return "mock_key_id";
    }

    @Override
    public PaymentContactDetails fetchPaymentDetails(String paymentId) {
        log.info("Fetching mock payment details for paymentId: {}", paymentId);
        return new PaymentContactDetails("mock.guest@example.com", "+919999999999", "Mock Guest", 0L, "INR");
    }
}
