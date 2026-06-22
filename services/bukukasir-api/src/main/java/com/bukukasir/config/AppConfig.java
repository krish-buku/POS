package com.bukukasir.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {

    @Bean
    public OpenAPI bukukasirOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("BukuKasir POS API")
                .description("Consolidated API for BukuKasir Point of Sale system")
                .version("1.0.0")
                .contact(new Contact().name("BukuKasir Team").email("dev@bukukasir.com")));
    }
}
