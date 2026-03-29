package com.bukukasir.shift.infrastructure.persistence.adapter;

import com.bukukasir.shift.domain.model.*;
import com.bukukasir.shift.domain.port.out.ShiftRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class ShiftPersistenceAdapter implements ShiftRepository {

    private final Map<String, Shift> shifts = new ConcurrentHashMap<>();
    private final Map<String, CashMovement> cashMovements = new ConcurrentHashMap<>();

    @Override
    public Shift save(Shift shift) {
        shifts.put(shift.getId(), shift);
        return shift;
    }

    @Override
    public Optional<Shift> findById(String id) {
        return Optional.ofNullable(shifts.get(id));
    }

    @Override
    public Optional<Shift> findOpenShiftByStaffAndBusiness(String staffId, String businessId) {
        return shifts.values().stream()
                .filter(s -> s.getStaffId().equals(staffId)
                        && s.getBusinessId().equals(businessId)
                        && s.getStatus() == ShiftStatus.OPEN)
                .findFirst();
    }

    @Override
    public List<Shift> findByBusinessIdAndDateRange(String businessId, LocalDateTime dateFrom, LocalDateTime dateTo) {
        return shifts.values().stream()
                .filter(s -> s.getBusinessId().equals(businessId))
                .filter(s -> dateFrom == null || !s.getOpenedAt().isBefore(dateFrom))
                .filter(s -> dateTo == null || !s.getOpenedAt().isAfter(dateTo))
                .sorted(Comparator.comparing(Shift::getOpenedAt).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public CashMovement saveCashMovement(CashMovement cashMovement) {
        cashMovements.put(cashMovement.getId(), cashMovement);
        return cashMovement;
    }

    @Override
    public List<CashMovement> findCashMovementsByShiftId(String shiftId) {
        return cashMovements.values().stream()
                .filter(m -> m.getShiftId().equals(shiftId))
                .sorted(Comparator.comparing(CashMovement::getCreatedAt))
                .collect(Collectors.toList());
    }
}
