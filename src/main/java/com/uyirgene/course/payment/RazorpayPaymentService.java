package com.uyirgene.course.payment;

import com.uyirgene.course.payment.dto.PaymentOrder;
import com.uyirgene.exception.PaymentException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@Profile("prod")
@Slf4j
public class RazorpayPaymentService implements PaymentProvider {

    @Value("${payment.razorpay.key-id:}")
    private String keyId;

    @Value("${payment.razorpay.key-secret:}")
    private String keySecret;

    private final RestTemplate restTemplate;

    public RazorpayPaymentService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public PaymentOrder createOrder(Long amountPaise, String receipt) {
        log.info("Creating Razorpay order for amount: {} paise, receipt: {}", amountPaise, receipt);

        String url = "https://api.razorpay.com/v1/orders";
        Map<String, Object> body = new HashMap<>();
        body.put("amount", amountPaise);
        body.put("currency", "INR");
        body.put("receipt", receipt);
        body.put("payment_capture", 1);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String auth = keyId + ":" + keySecret;
        String encoded = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + encoded);

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> resp = restTemplate.postForEntity(url, req, Map.class);

            if (resp.getStatusCode() != HttpStatus.OK && resp.getStatusCode() != HttpStatus.CREATED) {
                log.error("Failed to create Razorpay order. Status code: {}", resp.getStatusCode());
                throw new PaymentException("Failed to create Razorpay order");
            }

            Map data = resp.getBody();
            String orderId = String.valueOf(data.get("id"));
            Object amtObj = data.get("amount");
            Long amt = amtObj instanceof Number ? ((Number) amtObj).longValue() : Long.parseLong(amtObj.toString());
            String currency = (String) data.get("currency");

            log.info("Razorpay order created successfully: {}", orderId);

            return new PaymentOrder(orderId, amt, currency, keyId);

        } catch (PaymentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error creating Razorpay order", e);
            throw new PaymentException("Failed to create payment order", e);
        }
    }

    @Override
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        log.info("Verifying Razorpay signature for orderId: {}, paymentId: {}", orderId, paymentId);

        try {
            String payload = orderId + "|" + paymentId;
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hmac = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = java.util.HexFormat.of().formatHex(hmac).toLowerCase();

            boolean isValid = expected.equals(signature);

            if (isValid) {
                log.info("Razorpay signature verification successful");
            } else {
                log.warn("Razorpay signature verification failed");
            }

            return isValid;

        } catch (Exception e) {
            log.error("Error verifying Razorpay signature", e);
            return false;
        }
    }

    @Override
    public String getKeyId() {
        return keyId;
    }
}
