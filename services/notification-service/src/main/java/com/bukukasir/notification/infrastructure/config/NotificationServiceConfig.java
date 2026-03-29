package com.bukukasir.notification.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NotificationServiceConfig {
    @Bean
    public OpenAPI notificationServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir Notification Service API")
                .description("Notification service for BukuKasir POS").version("1.0.0"));
    }
}
