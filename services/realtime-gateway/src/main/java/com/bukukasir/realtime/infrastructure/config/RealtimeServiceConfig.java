package com.bukukasir.realtime.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RealtimeServiceConfig {
    @Bean
    public OpenAPI realtimeServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir Realtime Gateway API")
                .description("WebSocket and real-time event gateway for BukuKasir POS").version("1.0.0"));
    }
}
