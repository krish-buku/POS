package com.bukukasir.order.infrastructure.config;

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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Configuration
public class OrderServiceConfig {
    private final AuditLogger auditLoggerInstance = new InMemoryAuditLogger();

    @Bean
    public OpenAPI orderServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir Order Service API")
                .description("Order management for BukuKasir POS").version("1.0.0"));
    }

    @Bean
    public AuditLogger auditLogger() {
        return auditLoggerInstance;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedAuditLogs() {
        AuditLogger logger = auditLoggerInstance;
        logger.log(AuditLog.builder()
                .id("audit-order-001")
                .actorId("staff-003").actorName("Ahmad Wijaya").businessId("biz-001")
                .action(AuditAction.CREATE).entityType("Order").entityId("order-001")
                .description("Ahmad Wijaya created order ORD-001 for table T1")
                .newValues(Map.of("orderNumber", "ORD-001", "tableName", "T1", "total", new BigDecimal("73260")))
                .timestamp(LocalDateTime.now().minusHours(4))
                .build());
        logger.log(AuditLog.builder()
                .id("audit-order-002")
                .actorId("staff-004").actorName("Dewi Lestari").businessId("biz-001")
                .action(AuditAction.CREATE).entityType("Order").entityId("order-002")
                .description("Dewi Lestari created order ORD-002 for table T3")
                .newValues(Map.of("orderNumber", "ORD-002", "tableName", "T3", "total", new BigDecimal("58830")))
                .timestamp(LocalDateTime.now().minusHours(3))
                .build());
        logger.log(AuditLog.builder()
                .id("audit-order-003")
                .actorId("staff-003").actorName("Ahmad Wijaya").businessId("biz-001")
                .action(AuditAction.VOID).entityType("Order").entityId("order-005")
                .description("Ahmad Wijaya voided order ORD-005 - reason: Customer cancelled")
                .oldValues(Map.of("status", "PENDING", "total", new BigDecimal("39960")))
                .newValues(Map.of("status", "VOIDED", "voidReason", "Customer cancelled"))
                .timestamp(LocalDateTime.now().minusHours(2))
                .build());

        logger.log(AuditLog.builder()
                .id("audit-promo-001")
                .actorId("staff-003").actorName("Ahmad Wijaya").businessId("biz-001")
                .action(AuditAction.CREATE).entityType("Promotion").entityId("promo-001")
                .description("Ahmad Wijaya created promotion 'Happy Hour'")
                .newValues(Map.of("name", "Happy Hour", "type", "ORDER_DISCOUNT", "discountValue", "20%"))
                .timestamp(LocalDateTime.now().minusHours(5))
                .build());
    }
}
