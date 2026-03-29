package com.bukukasir.shift.application.mapper;

import com.bukukasir.shift.application.dto.ShiftResponse;
import com.bukukasir.shift.domain.model.CashMovement;
import com.bukukasir.shift.domain.model.Shift;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class ShiftMapper {

    public ShiftResponse toResponse(Shift shift) {
        List<ShiftResponse.CashMovementResponse> movementResponses = shift.getCashMovements() != null
                ? shift.getCashMovements().stream().map(this::toMovementResponse).toList()
                : Collections.emptyList();

        return new ShiftResponse(
                shift.getId(),
                shift.getBusinessId(),
                shift.getStaffId(),
                shift.getStaffName(),
                shift.getOpenedAt(),
                shift.getClosedAt(),
                shift.getOpeningCash(),
                shift.getClosingCash(),
                shift.getExpectedCash(),
                shift.getVariance(),
                shift.getStatus().name(),
                shift.getTotalSales(),
                shift.getTotalOrders(),
                shift.getCashPayments(),
                shift.getQrisPayments(),
                shift.getEdcPayments(),
                shift.getOtherPayments(),
                movementResponses,
                shift.getNotes()
        );
    }

    private ShiftResponse.CashMovementResponse toMovementResponse(CashMovement movement) {
        return new ShiftResponse.CashMovementResponse(
                movement.getId(),
                movement.getShiftId(),
                movement.getType().name(),
                movement.getAmount(),
                movement.getReason(),
                movement.getStaffId(),
                movement.getCreatedAt()
        );
    }
}
