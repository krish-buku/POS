package com.bukukasir.payment.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PaymentServiceConfig {
    @Bean
    public OpenAPI paymentServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir Payment Service API")
                .description("Payment processing for BukuKasir POS").version("1.0.0"));
    }
}
