package com.bukukasir.shift.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
@Entity
@Table(name = "cash_movements")
public class CashMovementEntity {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "shift_id")
    private String shiftId;

    @Column(name = "type")
    private String type;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "reason")
    private String reason;

    @Column(name = "staff_id")
    private String staffId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
