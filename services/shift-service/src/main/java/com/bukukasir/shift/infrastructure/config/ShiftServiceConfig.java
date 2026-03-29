package com.bukukasir.shift.infrastructure.config;

import com.bukukasir.common.audit.AuditAction;
import com.bukukasir.common.audit.AuditLog;
import com.bukukasir.common.audit.AuditLogger;
import com.bukukasir.common.audit.InMemoryAuditLogger;
import com.bukukasir.shift.domain.model.*;
import com.bukukasir.shift.domain.port.out.ShiftRepository;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Map;

@Configuration
public class ShiftServiceConfig {

    private final AuditLogger auditLoggerInstance = new InMemoryAuditLogger();

    @Bean
    public OpenAPI shiftServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BukuKasir Shift Service API")
                        .description("Shift management service for BukuKasir POS")
                        .version("1.0.0")
                        .contact(new Contact().name("BukuKasir Team").email("dev@bukukasir.com")));
    }

    @Bean
    public AuditLogger auditLogger() {
        return auditLoggerInstance;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void seedData(ApplicationReadyEvent event) {
        ShiftRepository shiftRepository = event.getApplicationContext().getBean(ShiftRepository.class);

        // Shift 1: OPEN (current, staff-003 Budi)
        Shift openShift = Shift.builder()
                .id("shift-001")
                .businessId("biz-001")
                .staffId("staff-003")
                .staffName("Budi")
                .openedAt(LocalDateTime.now().withHour(8).withMinute(0).withSecond(0))
                .openingCash(new BigDecimal("500000"))
                .status(ShiftStatus.OPEN)
                .totalSales(new BigDecimal("3500000"))
                .totalOrders(25)
                .cashPayments(new BigDecimal("750000"))
                .qrisPayments(new BigDecimal("1500000"))
                .edcPayments(new BigDecimal("1000000"))
                .otherPayments(new BigDecimal("250000"))
                .cashMovements(new ArrayList<>())
                .build();
        shiftRepository.save(openShift);

        // Shift 2: CLOSED (yesterday, staff-004 Ani)
        Shift closedShift = Shift.builder()
                .id("shift-002")
                .businessId("biz-001")
                .staffId("staff-004")
                .staffName("Ani")
                .openedAt(LocalDateTime.now().minusDays(1).withHour(8).withMinute(0).withSecond(0))
                .closedAt(LocalDateTime.now().minusDays(1).withHour(16).withMinute(30).withSecond(0))
                .openingCash(new BigDecimal("500000"))
                .closingCash(new BigDecimal("1245000"))
                .expectedCash(new BigDecimal("1250000"))
                .variance(new BigDecimal("-5000"))
                .status(ShiftStatus.CLOSED)
                .totalSales(new BigDecimal("4200000"))
                .totalOrders(32)
                .cashPayments(new BigDecimal("900000"))
                .qrisPayments(new BigDecimal("1800000"))
                .edcPayments(new BigDecimal("1200000"))
                .otherPayments(new BigDecimal("300000"))
                .cashMovements(new ArrayList<>())
                .notes("Minor shortage, possibly miscounted small change")
                .build();
        shiftRepository.save(closedShift);

        // Cash movements on the closed shift
        CashMovement cashIn = CashMovement.builder()
                .id("cm-001")
                .shiftId("shift-002")
                .type(CashMovementType.CASH_IN)
                .amount(new BigDecimal("200000"))
                .reason("Additional change for register")
                .staffId("staff-004")
                .createdAt(LocalDateTime.now().minusDays(1).withHour(10).withMinute(0))
                .build();
        shiftRepository.saveCashMovement(cashIn);

        CashMovement cashOut = CashMovement.builder()
                .id("cm-002")
                .shiftId("shift-002")
                .type(CashMovementType.CASH_OUT)
                .amount(new BigDecimal("50000"))
                .reason("Purchase cleaning supplies")
                .staffId("staff-004")
                .createdAt(LocalDateTime.now().minusDays(1).withHour(14).withMinute(30))
                .build();
        shiftRepository.saveCashMovement(cashOut);

        // Seed audit logs
        AuditLogger logger = auditLoggerInstance;
        logger.log(AuditLog.builder()
                .id("audit-shift-001")
                .actorId("staff-003").actorName("Budi").businessId("biz-001")
                .action(AuditAction.CREATE).entityType("Shift").entityId("shift-001")
                .description("Budi opened shift with Rp500,000 opening cash")
                .newValues(Map.of("openingCash", "500000", "status", "OPEN"))
                .timestamp(LocalDateTime.now().withHour(8).withMinute(0))
                .build());
        logger.log(AuditLog.builder()
                .id("audit-shift-002")
                .actorId("staff-004").actorName("Ani").businessId("biz-001")
                .action(AuditAction.STATUS_CHANGE).entityType("Shift").entityId("shift-002")
                .description("Ani closed shift with Rp-5,000 variance")
                .newValues(Map.of("closingCash", "1245000", "expectedCash", "1250000", "variance", "-5000", "status", "CLOSED"))
                .timestamp(LocalDateTime.now().minusDays(1).withHour(16).withMinute(30))
                .build());
    }
}
