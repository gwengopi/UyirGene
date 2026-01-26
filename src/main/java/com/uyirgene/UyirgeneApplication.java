package com.uyirgene;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class UyirgeneApplication {
    public static void main(String[] args) {
        SpringApplication.run(UyirgeneApplication.class, args);
    }
}
