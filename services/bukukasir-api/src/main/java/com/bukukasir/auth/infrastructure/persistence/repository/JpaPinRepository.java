package com.bukukasir.auth.infrastructure.persistence.repository;

import com.bukukasir.auth.infrastructure.persistence.entity.PinEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JpaPinRepository extends JpaRepository<PinEntity, String> {

    Optional<PinEntity> findByStaffId(String staffId);

    Optional<PinEntity> findFirstByBusinessIdAndHashedPin(String businessId, String hashedPin);

    List<PinEntity> findByBusinessId(String businessId);
}
