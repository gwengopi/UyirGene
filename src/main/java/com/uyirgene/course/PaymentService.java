package com.uyirgene.course;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    private final RestTemplate restTemplate = new RestTemplate();

    public RazorOrder createOrder(Long amountPaise, String receipt) {
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

        HttpEntity<Map<String,Object>> req = new HttpEntity<>(body, headers);
        ResponseEntity<Map> resp = restTemplate.postForEntity(url, req, Map.class);
        if (resp.getStatusCode() != HttpStatus.OK && resp.getStatusCode() != HttpStatus.CREATED) {
            throw new RuntimeException("Failed to create Razorpay order");
        }
        Map data = resp.getBody();
        String orderId = String.valueOf(data.get("id"));
        Integer amt = (Integer) data.get("amount");
        String currency = (String) data.get("currency");
        return new RazorOrder(orderId, amt, currency, keyId);
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hmac = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expected = java.util.HexFormat.of().formatHex(hmac).toLowerCase();
            return expected.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }

    public static class RazorOrder {
        private String id;
        private Integer amount;
        private String currency;
        private String keyId;

        public RazorOrder(String id, Integer amount, String currency, String keyId) {
            this.id = id;
            this.amount = amount;
            this.currency = currency;
            this.keyId = keyId;
        }

        public String getId() { return id; }
        public Integer getAmount() { return amount; }
        public String getCurrency() { return currency; }
        public String getKeyId() { return keyId; }
    }
}
