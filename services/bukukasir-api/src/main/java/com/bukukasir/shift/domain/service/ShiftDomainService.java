package com.bukukasir.shift.domain.service;

import com.bukukasir.common.exception.BusinessException;
import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.shift.domain.model.*;
import com.bukukasir.shift.domain.port.in.ShiftUseCase;
import com.bukukasir.shift.domain.port.out.ShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShiftDomainService implements ShiftUseCase {

    private final ShiftRepository shiftRepository;

    @Override
    public Shift openShift(String staffId, String staffName, String businessId, BigDecimal openingCash) {
        // Only ONE open shift per staff per business at a time
        shiftRepository.findOpenShiftByStaffAndBusiness(staffId, businessId)
                .ifPresent(existing -> {
                    throw new BusinessException("SHIFT_ALREADY_OPEN",
                            "Staff " + staffId + " already has an open shift (id: " + existing.getId() + ")");
                });

        Shift shift = Shift.builder()
                .id(IdGenerator.generateId())
                .businessId(businessId)
                .staffId(staffId)
                .staffName(staffName)
                .openedAt(LocalDateTime.now())
                .openingCash(openingCash)
                .status(ShiftStatus.OPEN)
                .totalSales(BigDecimal.ZERO)
                .totalOrders(0)
                .cashPayments(BigDecimal.ZERO)
                .qrisPayments(BigDecimal.ZERO)
                .edcPayments(BigDecimal.ZERO)
                .otherPayments(BigDecimal.ZERO)
                .build();

        return shiftRepository.save(shift);
    }

    @Override
    public Shift closeShift(String shiftId, BigDecimal closingCash, String notes) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", shiftId));

        if (shift.getStatus() != ShiftStatus.OPEN) {
            throw new BusinessException("SHIFT_NOT_OPEN", "Shift is not open, current status: " + shift.getStatus());
        }

        // Load cash movements
        List<CashMovement> movements = shiftRepository.findCashMovementsByShiftId(shiftId);
        shift.setCashMovements(movements);

        // Calculate expected cash: openingCash + cashPayments + cashIn - cashOut
        BigDecimal totalCashIn = movements.stream()
                .filter(m -> m.getType() == CashMovementType.CASH_IN)
                .map(CashMovement::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCashOut = movements.stream()
                .filter(m -> m.getType() == CashMovementType.CASH_OUT)
                .map(CashMovement::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expectedCash = shift.getOpeningCash()
                .add(shift.getCashPayments())
                .add(totalCashIn)
                .subtract(totalCashOut);

        shift.setClosedAt(LocalDateTime.now());
        shift.setClosingCash(closingCash);
        shift.setExpectedCash(expectedCash);
        shift.setVariance(closingCash.subtract(expectedCash));
        shift.setStatus(ShiftStatus.CLOSED);
        shift.setNotes(notes);

        return shiftRepository.save(shift);
    }

    @Override
    public Shift getCurrentShift(String staffId, String businessId) {
        return shiftRepository.findOpenShiftByStaffAndBusiness(staffId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift",
                        "staffId/businessId", staffId + "/" + businessId));
    }

    @Override
    public Shift getShiftById(String shiftId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", shiftId));
        List<CashMovement> movements = shiftRepository.findCashMovementsByShiftId(shiftId);
        shift.setCashMovements(movements);
        return shift;
    }

    @Override
    public List<Shift> listShifts(String businessId, LocalDateTime dateFrom, LocalDateTime dateTo) {
        return shiftRepository.findByBusinessIdAndDateRange(businessId, dateFrom, dateTo);
    }

    @Override
    public CashMovement addCashMovement(String shiftId, String type, BigDecimal amount, String reason, String staffId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift", "id", shiftId));

        if (shift.getStatus() != ShiftStatus.OPEN) {
            throw new BusinessException("SHIFT_NOT_OPEN", "Cannot add cash movement to a closed shift");
        }

        CashMovementType movementType = CashMovementType.valueOf(type);

        CashMovement movement = CashMovement.builder()
                .id(IdGenerator.generateId())
                .shiftId(shiftId)
                .type(movementType)
                .amount(amount)
                .reason(reason)
                .staffId(staffId)
                .createdAt(LocalDateTime.now())
                .build();

        return shiftRepository.saveCashMovement(movement);
    }

    @Override
    public ZReport generateZReport(String shiftId) {
        Shift shift = getShiftById(shiftId);

        List<CashMovement> movements = shift.getCashMovements();
        BigDecimal totalIn = movements.stream()
                .filter(m -> m.getType() == CashMovementType.CASH_IN)
                .map(CashMovement::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalOut = movements.stream()
                .filter(m -> m.getType() == CashMovementType.CASH_OUT)
                .map(CashMovement::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageOrderValue = shift.getTotalOrders() > 0
                ? shift.getTotalSales().divide(BigDecimal.valueOf(shift.getTotalOrders()), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, BigDecimal> paymentBreakdown = new LinkedHashMap<>();
        paymentBreakdown.put("CASH", shift.getCashPayments());
        paymentBreakdown.put("QRIS", shift.getQrisPayments());
        paymentBreakdown.put("EDC", shift.getEdcPayments());
        paymentBreakdown.put("OTHER", shift.getOtherPayments());

        String duration = "N/A";
        if (shift.getOpenedAt() != null) {
            LocalDateTime endTime = shift.getClosedAt() != null ? shift.getClosedAt() : LocalDateTime.now();
            Duration dur = Duration.between(shift.getOpenedAt(), endTime);
            long hours = dur.toHours();
            long minutes = dur.toMinutesPart();
            duration = hours + "h " + minutes + "m";
        }

        return ZReport.builder()
                .shiftId(shift.getId())
                .businessId(shift.getBusinessId())
                .staffName(shift.getStaffName())
                .openedAt(shift.getOpenedAt())
                .closedAt(shift.getClosedAt())
                .duration(duration)
                .openingCash(shift.getOpeningCash())
                .closingCash(shift.getClosingCash())
                .expectedCash(shift.getExpectedCash())
                .variance(shift.getVariance())
                .totalSales(shift.getTotalSales())
                .totalOrders(shift.getTotalOrders())
                .averageOrderValue(averageOrderValue)
                .paymentBreakdown(paymentBreakdown)
                .cashMovementTotalIn(totalIn)
                .cashMovementTotalOut(totalOut)
                .build();
    }
}
