package com.bukukasir.shift.infrastructure.persistence.repository;

import com.bukukasir.shift.infrastructure.persistence.entity.CashMovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaCashMovementRepository extends JpaRepository<CashMovementEntity, String> {

    List<CashMovementEntity> findByShiftId(String shiftId);

    List<CashMovementEntity> findByShiftIdOrderByCreatedAtAsc(String shiftId);
}
