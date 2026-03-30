package com.bukukasir.shift.domain.port.out;

import com.bukukasir.shift.domain.model.CashMovement;
import com.bukukasir.shift.domain.model.Shift;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ShiftRepository {

    Shift save(Shift shift);

    Optional<Shift> findById(String id);

    Optional<Shift> findOpenShiftByStaffAndBusiness(String staffId, String businessId);

    List<Shift> findByBusinessIdAndDateRange(String businessId, LocalDateTime dateFrom, LocalDateTime dateTo);

    CashMovement saveCashMovement(CashMovement cashMovement);

    List<CashMovement> findCashMovementsByShiftId(String shiftId);
}
