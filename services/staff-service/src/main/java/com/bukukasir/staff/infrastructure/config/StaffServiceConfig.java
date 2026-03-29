package com.bukukasir.staff.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StaffServiceConfig {

    @Bean
    public OpenAPI staffServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BukuKasir Staff Service API")
                        .description("Staff management for BukuKasir POS")
                        .version("1.0.0")
                        .contact(new Contact().name("BukuKasir Team").email("dev@bukukasir.com")));
    }
}
