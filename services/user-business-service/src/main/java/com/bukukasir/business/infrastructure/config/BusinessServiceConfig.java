package com.bukukasir.business.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BusinessServiceConfig {

    @Bean
    public OpenAPI businessServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BukuKasir User & Business Service API")
                        .description("Manages users and business profiles for BukuKasir POS")
                        .version("1.0.0")
                        .contact(new Contact().name("BukuKasir Team").email("dev@bukukasir.com")));
    }
}
