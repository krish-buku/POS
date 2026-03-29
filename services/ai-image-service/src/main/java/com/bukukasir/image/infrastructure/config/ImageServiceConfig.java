package com.bukukasir.image.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ImageServiceConfig {
    @Bean
    public OpenAPI imageServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir AI Image Service API")
                .description("AI image generation for BukuKasir POS").version("1.0.0"));
    }
}
