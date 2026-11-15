package com.uyirgene.config;

import org.junit.jupiter.api.Test;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The shared RestTemplate (Razorpay, Google sign-in, Google reviews) must have timeouts, so a hung
 * upstream cannot hold a request thread or a DB transaction forever.
 */
public class RestTemplateConfigTest {

    @Test
    void restTemplate_hasConnectAndReadTimeouts() {
        RestTemplate restTemplate = new RestTemplateConfig().restTemplate();

        ClientHttpRequestFactory factory = restTemplate.getRequestFactory();
        // Same factory type as the previous default `new RestTemplate()`
        assertThat(factory).isInstanceOf(SimpleClientHttpRequestFactory.class);
        assertThat(ReflectionTestUtils.getField(factory, "connectTimeout"))
                .isEqualTo(RestTemplateConfig.CONNECT_TIMEOUT_MS);
        assertThat(ReflectionTestUtils.getField(factory, "readTimeout"))
                .isEqualTo(RestTemplateConfig.READ_TIMEOUT_MS);
    }

    @Test
    void timeouts_areFiniteAndReasonableForPaymentApis() {
        assertThat(RestTemplateConfig.CONNECT_TIMEOUT_MS).isBetween(1_000, 10_000);
        assertThat(RestTemplateConfig.READ_TIMEOUT_MS).isBetween(5_000, 30_000);
    }
}
