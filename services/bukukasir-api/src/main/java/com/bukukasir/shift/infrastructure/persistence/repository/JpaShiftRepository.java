package com.bukukasir.shift.infrastructure.persistence.repository;

import com.bukukasir.shift.infrastructure.persistence.entity.ShiftEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JpaShiftRepository extends JpaRepository<ShiftEntity, String> {

    Optional<ShiftEntity> findByStaffIdAndBusinessIdAndStatus(String staffId, String businessId, String status);

    List<ShiftEntity> findByBusinessId(String businessId);

    List<ShiftEntity> findByBusinessIdAndOpenedAtBetween(String businessId, LocalDateTime dateFrom, LocalDateTime dateTo);

    List<ShiftEntity> findByBusinessIdAndOpenedAtBetweenOrderByOpenedAtDesc(String businessId, LocalDateTime dateFrom, LocalDateTime dateTo);

    List<ShiftEntity> findByStaffId(String staffId);
}
