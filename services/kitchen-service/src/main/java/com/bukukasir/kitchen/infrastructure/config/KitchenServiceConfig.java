package com.bukukasir.kitchen.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KitchenServiceConfig {
    @Bean
    public OpenAPI kitchenServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir Kitchen Service API")
                .description("Kitchen display system for BukuKasir POS").version("1.0.0"));
    }
}
