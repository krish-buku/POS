package com.bukukasir.table.infrastructure.config;

import com.bukukasir.common.audit.AuditAction;
import com.bukukasir.common.audit.AuditLog;
import com.bukukasir.common.audit.AuditLogger;
import com.bukukasir.common.audit.InMemoryAuditLogger;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

import java.time.LocalDateTime;
import java.util.Map;

@Configuration
public class TableServiceConfig {
    private final AuditLogger auditLoggerInstance = new InMemoryAuditLogger();

    @Bean
    public OpenAPI tableServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir Table Service API")
                .description("Table management for BukuKasir POS").version("1.0.0"));
    }

    @Bean
    public AuditLogger auditLogger() {
        return auditLoggerInstance;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedAuditLogs() {
        AuditLogger logger = auditLoggerInstance;
        logger.log(AuditLog.builder()
                .id("audit-table-001")
                .actorId("staff-004").actorName("Dewi Lestari").businessId("biz-001")
                .action(AuditAction.STATUS_CHANGE).entityType("Table").entityId("table-001")
                .description("Changed table T1 status from AVAILABLE to OCCUPIED")
                .oldValues(Map.of("status", "AVAILABLE"))
                .newValues(Map.of("status", "OCCUPIED"))
                .timestamp(LocalDateTime.now().minusHours(4))
                .build());
        logger.log(AuditLog.builder()
                .id("audit-table-002")
                .actorId("staff-004").actorName("Dewi Lestari").businessId("biz-001")
                .action(AuditAction.STATUS_CHANGE).entityType("Table").entityId("table-007")
                .description("Changed table T7 status from OCCUPIED to CLEANING")
                .oldValues(Map.of("status", "OCCUPIED"))
                .newValues(Map.of("status", "CLEANING"))
                .timestamp(LocalDateTime.now().minusHours(2))
                .build());
        logger.log(AuditLog.builder()
                .id("audit-table-003")
                .actorId("staff-003").actorName("Ahmad Wijaya").businessId("biz-001")
                .action(AuditAction.TRANSFER).entityType("Table").entityId("table-005")
                .description("Transferred order from table T5 to table T8")
                .oldValues(Map.of("fromTable", "T5", "fromTableId", "table-005"))
                .newValues(Map.of("toTable", "T8", "toTableId", "table-008"))
                .timestamp(LocalDateTime.now().minusHours(1))
                .build());
    }
}
