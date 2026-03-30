package com.bukukasir.staff.infrastructure.persistence.repository;

import com.bukukasir.staff.infrastructure.persistence.entity.StaffEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaStaffRepository extends JpaRepository<StaffEntity, String> {

    List<StaffEntity> findByBusinessId(String businessId);

    List<StaffEntity> findByBusinessIdAndActiveTrue(String businessId);
}
