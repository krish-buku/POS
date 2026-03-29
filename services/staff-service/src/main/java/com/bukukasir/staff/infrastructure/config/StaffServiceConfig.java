package com.bukukasir.staff.infrastructure.config;

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
public class StaffServiceConfig {

    private final AuditLogger auditLoggerInstance = new InMemoryAuditLogger();

    @Bean
    public OpenAPI staffServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BukuKasir Staff Service API")
                        .description("Staff management for BukuKasir POS")
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
                .id("audit-staff-001")
                .actorId("staff-001").actorName("Budi Santoso").businessId("biz-001")
                .action(AuditAction.CREATE).entityType("Staff").entityId("staff-003")
                .description("Created staff member: Ahmad Wijaya (CASHIER)")
                .newValues(Map.of("name", "Ahmad Wijaya", "role", "CASHIER", "email", "ahmad@warung.com"))
                .timestamp(LocalDateTime.now().minusDays(7))
                .build());
        logger.log(AuditLog.builder()
                .id("audit-staff-002")
                .actorId("staff-001").actorName("Budi Santoso").businessId("biz-001")
                .action(AuditAction.CREATE).entityType("Staff").entityId("staff-004")
                .description("Created staff member: Dewi Lestari (WAITER)")
                .newValues(Map.of("name", "Dewi Lestari", "role", "WAITER", "email", "dewi@warung.com"))
                .timestamp(LocalDateTime.now().minusDays(5))
                .build());
        logger.log(AuditLog.builder()
                .id("audit-staff-003")
                .actorId("staff-002").actorName("Siti Rahayu").businessId("biz-001")
                .action(AuditAction.RESET_PIN).entityType("Staff").entityId("staff-004")
                .description("Reset PIN for staff member: Dewi Lestari")
                .timestamp(LocalDateTime.now().minusDays(1))
                .build());
    }
}
