package com.bukukasir.receipt.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ReceiptServiceConfig {
    @Bean
    public OpenAPI receiptServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir Receipt Service API")
                .description("Receipt and printing for BukuKasir POS").version("1.0.0"));
    }
}
