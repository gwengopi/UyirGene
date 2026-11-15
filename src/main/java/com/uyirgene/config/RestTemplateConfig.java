package com.uyirgene.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    /** Time allowed to open a connection to an upstream API (Razorpay, Google). */
    static final int CONNECT_TIMEOUT_MS = 5_000;
    /** Time allowed to wait for the upstream response. Razorpay normally answers in about a second. */
    static final int READ_TIMEOUT_MS = 20_000;

    @Bean
    public RestTemplate restTemplate() {
        // Same request factory as the default `new RestTemplate()`, but with timeouts. Without them a
        // hung upstream holds a request thread (and any open DB transaction) indefinitely.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(CONNECT_TIMEOUT_MS);
        factory.setReadTimeout(READ_TIMEOUT_MS);
        return new RestTemplate(factory);
    }
}
