package com.bukukasir.report.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ReportServiceConfig {
    @Bean
    public OpenAPI reportServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir Report Service API")
                .description("Reporting and analytics for BukuKasir POS").version("1.0.0"));
    }
}
