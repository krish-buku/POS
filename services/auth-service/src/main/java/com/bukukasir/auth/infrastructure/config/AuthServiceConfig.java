package com.bukukasir.auth.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuthServiceConfig {

    @Bean
    public OpenAPI authServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BukuKasir Auth Service API")
                        .description("PIN-based authentication service for BukuKasir POS")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("BukuKasir Team")
                                .email("dev@bukukasir.com")));
    }
}
