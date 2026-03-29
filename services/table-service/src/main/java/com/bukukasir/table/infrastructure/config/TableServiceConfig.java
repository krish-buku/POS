package com.bukukasir.table.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TableServiceConfig {
    @Bean
    public OpenAPI tableServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir Table Service API")
                .description("Table management for BukuKasir POS").version("1.0.0"));
    }
}
