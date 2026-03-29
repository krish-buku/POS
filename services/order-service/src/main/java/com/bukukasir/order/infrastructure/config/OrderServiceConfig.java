package com.bukukasir.order.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OrderServiceConfig {
    @Bean
    public OpenAPI orderServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir Order Service API")
                .description("Order management for BukuKasir POS").version("1.0.0"));
    }
}
