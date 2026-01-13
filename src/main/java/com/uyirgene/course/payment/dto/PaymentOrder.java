package com.uyirgene.course.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrder {
    private String id;
    private Integer amount;
    private String currency;
    private String keyId;
}
