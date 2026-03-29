package com.bukukasir.payment.infrastructure.config;

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
public class PaymentServiceConfig {
    private final AuditLogger auditLoggerInstance = new InMemoryAuditLogger();

    @Bean
    public OpenAPI paymentServiceOpenAPI() {
        return new OpenAPI().info(new Info().title("BukuKasir Payment Service API")
                .description("Payment processing for BukuKasir POS").version("1.0.0"));
    }

    @Bean
    public AuditLogger auditLogger() {
        return auditLoggerInstance;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedAuditLogs() {
        AuditLogger logger = auditLoggerInstance;
        logger.log(AuditLog.builder()
                .id("audit-pay-001")
                .actorId("staff-003").actorName("Ahmad Wijaya").businessId("biz-001")
                .action(AuditAction.CREATE).entityType("Payment").entityId("pay-001")
                .description("Recorded payment for order ORD-004 via Cash")
                .newValues(Map.of("orderId", "order-004", "amount", new BigDecimal("24420"), "paymentMethod", "Cash", "status", "COMPLETED"))
                .timestamp(LocalDateTime.now().minusHours(5))
                .build());
        logger.log(AuditLog.builder()
                .id("audit-pay-002")
                .actorId("staff-003").actorName("Ahmad Wijaya").businessId("biz-001")
                .action(AuditAction.CREATE).entityType("Payment").entityId("pay-002")
                .description("Recorded payment for order ORD-001 via GoPay")
                .newValues(Map.of("orderId", "order-001", "amount", new BigDecimal("73260"), "paymentMethod", "GoPay", "status", "COMPLETED"))
                .timestamp(LocalDateTime.now().minusHours(3))
                .build());
        logger.log(AuditLog.builder()
                .id("audit-pay-003")
                .actorId("staff-001").actorName("Budi Santoso").businessId("biz-001")
                .action(AuditAction.CREATE).entityType("PaymentMethod").entityId("pm-001")
                .description("Created payment method: Cash (CASH)")
                .newValues(Map.of("name", "Cash", "type", "CASH", "active", true))
                .timestamp(LocalDateTime.now().minusDays(30))
                .build());
    }
}
