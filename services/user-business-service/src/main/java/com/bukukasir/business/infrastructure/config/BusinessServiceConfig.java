package com.bukukasir.business.infrastructure.config;

import com.bukukasir.common.audit.AuditAction;
import com.bukukasir.common.audit.AuditLog;
import com.bukukasir.common.audit.AuditLogger;
import com.bukukasir.common.audit.InMemoryAuditLogger;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

import java.time.LocalDateTime;
import java.util.Map;

@Configuration
public class BusinessServiceConfig {
    private final AuditLogger auditLoggerInstance = new InMemoryAuditLogger();

    @Bean
    public OpenAPI businessServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BukuKasir User & Business Service API")
                        .description("Manages users, business profiles, and customer profiles for BukuKasir POS")
                        .version("1.0.0")
                        .contact(new Contact().name("BukuKasir Team").email("dev@bukukasir.com")));
    }

    @Bean
    public AuditLogger auditLogger() {
        return auditLoggerInstance;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedAuditLogs() {
        AuditLogger logger = auditLoggerInstance;
        logger.log(AuditLog.builder()
                .id("audit-cust-001")
                .actorId("user-001").actorName("Admin").businessId("biz-001")
                .action(AuditAction.CREATE).entityType("Customer").entityId("cust-001")
                .description("Admin created customer 'Pak Hendra'")
                .newValues(Map.of("name", "Pak Hendra", "phone", "+6281234567001"))
                .timestamp(LocalDateTime.now().minusDays(5))
                .build());
        logger.log(AuditLog.builder()
                .id("audit-cust-002")
                .actorId("user-001").actorName("Admin").businessId("biz-001")
                .action(AuditAction.CREATE).entityType("Customer").entityId("cust-002")
                .description("Admin created customer 'Ibu Sari'")
                .newValues(Map.of("name", "Ibu Sari", "phone", "+6281234567002"))
                .timestamp(LocalDateTime.now().minusDays(4))
                .build());
    }
}
