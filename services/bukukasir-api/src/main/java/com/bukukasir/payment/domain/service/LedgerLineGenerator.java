package com.bukukasir.payment.domain.service;

import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.payment.domain.model.LineType;
import com.bukukasir.payment.domain.model.Payment;
import com.bukukasir.payment.domain.model.TransactionLine;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class LedgerLineGenerator {

    /**
     * Generates auditable ledger lines from payment data.
     * The sum of all line amounts should equal payment.amountPaid (minus change).
     */
    public List<TransactionLine> generateLedgerLines(Payment payment) {
        List<TransactionLine> lines = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        BigDecimal amount = payment.getAmount();

        // Estimate tax and subtotal from the total amount using PPN 11%
        // Reverse: subtotal = amount / 1.11, tax = amount - subtotal
        BigDecimal taxRate = new BigDecimal("0.11");
        BigDecimal divisor = BigDecimal.ONE.add(taxRate);
        BigDecimal subtotal = amount.divide(divisor, 0, RoundingMode.HALF_UP);
        BigDecimal taxAmount = amount.subtract(subtotal);

        // Add ORDER_ITEM line for the subtotal
        lines.add(TransactionLine.builder()
                .id(IdGenerator.generateId())
                .transactionId(payment.getId())
                .lineType(LineType.ORDER_ITEM)
                .description("Order subtotal for " + payment.getOrderNumber())
                .amount(subtotal)
                .referenceId(payment.getOrderId())
                .createdAt(now)
                .build());

        // Add TAX_PPN line if tax > 0
        if (taxAmount.compareTo(BigDecimal.ZERO) > 0) {
            lines.add(TransactionLine.builder()
                    .id(IdGenerator.generateId())
                    .transactionId(payment.getId())
                    .lineType(LineType.TAX_PPN)
                    .description("PPN 11%")
                    .amount(taxAmount)
                    .referenceId(payment.getOrderId())
                    .createdAt(now)
                    .build());
        }

        // Check if rounding was applied (sum of lines vs actual amount)
        BigDecimal lineSum = lines.stream()
                .map(TransactionLine::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal roundingDiff = amount.subtract(lineSum);
        if (roundingDiff.compareTo(BigDecimal.ZERO) != 0) {
            lines.add(TransactionLine.builder()
                    .id(IdGenerator.generateId())
                    .transactionId(payment.getId())
                    .lineType(LineType.ROUNDING)
                    .description("Rounding adjustment")
                    .amount(roundingDiff)
                    .referenceId(payment.getOrderId())
                    .createdAt(now)
                    .build());
        }

        return lines;
    }

    /**
     * Generates VOID_REVERSAL lines that negate the original ledger lines.
     */
    public List<TransactionLine> generateVoidReversalLines(Payment payment) {
        List<TransactionLine> reversalLines = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        if (payment.getLedgerLines() == null || payment.getLedgerLines().isEmpty()) {
            return reversalLines;
        }

        for (TransactionLine original : payment.getLedgerLines()) {
            // Skip existing reversal lines
            if (original.getLineType() == LineType.VOID_REVERSAL) {
                continue;
            }
            reversalLines.add(TransactionLine.builder()
                    .id(IdGenerator.generateId())
                    .transactionId(payment.getId())
                    .lineType(LineType.VOID_REVERSAL)
                    .description("VOID: " + original.getDescription())
                    .amount(original.getAmount().negate())
                    .referenceId(original.getId())
                    .createdAt(now)
                    .build());
        }

        return reversalLines;
    }
}
