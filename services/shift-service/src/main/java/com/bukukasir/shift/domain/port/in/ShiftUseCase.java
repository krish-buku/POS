package com.bukukasir.shift.domain.port.in;

import com.bukukasir.shift.domain.model.CashMovement;
import com.bukukasir.shift.domain.model.Shift;
import com.bukukasir.shift.domain.model.ZReport;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface ShiftUseCase {

    Shift openShift(String staffId, String staffName, String businessId, BigDecimal openingCash);

    Shift closeShift(String shiftId, BigDecimal closingCash, String notes);

    Shift getCurrentShift(String staffId, String businessId);

    Shift getShiftById(String shiftId);

    List<Shift> listShifts(String businessId, LocalDateTime dateFrom, LocalDateTime dateTo);

    CashMovement addCashMovement(String shiftId, String type, BigDecimal amount, String reason, String staffId);

    ZReport generateZReport(String shiftId);
}
