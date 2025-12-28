package com.uyirgene.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(info = @Info(title = "Uyirgene API", version = "1.0", description = "API for Uyirgene application"))
@Configuration
public class OpenApiConfig {
}
