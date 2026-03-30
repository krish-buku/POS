package com.bukukasir.business.infrastructure.persistence.repository;

import com.bukukasir.business.infrastructure.persistence.entity.BusinessEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JpaBusinessRepository extends JpaRepository<BusinessEntity, String> {

    List<BusinessEntity> findByOwnerId(String ownerId);

    List<BusinessEntity> findByActiveTrue();
}
