package com.bukukasir.payment.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "payments")
public class PaymentEntity {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "order_id")
    private String orderId;

    @Column(name = "order_number")
    private String orderNumber;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "amount_paid")
    private BigDecimal amountPaid;

    @Column(name = "change_amount")
    private BigDecimal change;

    @Column(name = "payment_method_id")
    private String paymentMethodId;

    @Column(name = "payment_method_name")
    private String paymentMethodName;

    @Column(name = "status")
    private String status;

    @Column(name = "staff_id")
    private String staffId;

    @Column(name = "business_id")
    private String businessId;

    @Column(name = "splits", columnDefinition = "jsonb")
    private String splits;

    @Column(name = "ledger_lines", columnDefinition = "jsonb")
    private String ledgerLines;

    @Column(name = "created_at")
    private Instant createdAt;
}
