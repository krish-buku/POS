package com.bukukasir.menu.infrastructure.config;

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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Configuration
public class MenuServiceConfig {
    private final AuditLogger auditLoggerInstance = new InMemoryAuditLogger();

    @Bean
    public OpenAPI menuServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir Menu Service API")
                .description("Menu management for BukuKasir POS").version("1.0.0")
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
                .id("audit-menu-001")
                .actorId("staff-001").actorName("Budi Santoso").businessId("biz-001")
                .action(AuditAction.CREATE).entityType("MenuItem").entityId("menu-001")
                .description("Created menu item: Nasi Goreng Spesial (Rp 25000)")
                .newValues(Map.of("name", "Nasi Goreng Spesial", "price", new BigDecimal("25000"), "categoryId", "cat-001"))
                .timestamp(LocalDateTime.now().minusDays(14))
                .build());
        logger.log(AuditLog.builder()
                .id("audit-menu-002")
                .actorId("staff-002").actorName("Siti Rahayu").businessId("biz-001")
                .action(AuditAction.UPDATE).entityType("MenuItem").entityId("menu-007")
                .description("Updated menu item: Kopi Susu")
                .oldValues(Map.of("name", "Kopi Susu", "price", new BigDecimal("12000")))
                .newValues(Map.of("name", "Kopi Susu", "price", new BigDecimal("15000")))
                .timestamp(LocalDateTime.now().minusDays(3))
                .build());
        logger.log(AuditLog.builder()
                .id("audit-menu-003")
                .actorId("staff-002").actorName("Siti Rahayu").businessId("biz-001")
                .action(AuditAction.STATUS_CHANGE).entityType("MenuItem").entityId("menu-009")
                .description("Changed availability of Tahu Crispy to unavailable")
                .oldValues(Map.of("available", true))
                .newValues(Map.of("available", false))
                .timestamp(LocalDateTime.now().minusHours(6))
                .build());
    }
}
