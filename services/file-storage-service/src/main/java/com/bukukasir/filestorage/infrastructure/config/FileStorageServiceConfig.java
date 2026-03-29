package com.bukukasir.filestorage.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FileStorageServiceConfig {
    @Bean
    public OpenAPI fileStorageServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir File Storage Service API")
                .description("File storage for BukuKasir POS").version("1.0.0"));
    }
}
