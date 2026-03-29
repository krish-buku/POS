package com.bukukasir.shift.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashMovement {

    private String id;
    private String shiftId;
    private CashMovementType type;
    private BigDecimal amount;
    private String reason;
    private String staffId;
    private LocalDateTime createdAt;
}
