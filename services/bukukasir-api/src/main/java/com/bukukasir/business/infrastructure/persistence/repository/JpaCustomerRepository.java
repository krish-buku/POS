package com.bukukasir.business.infrastructure.persistence.repository;

import com.bukukasir.business.infrastructure.persistence.entity.CustomerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JpaCustomerRepository extends JpaRepository<CustomerEntity, String> {

    List<CustomerEntity> findByBusinessId(String businessId);

    Optional<CustomerEntity> findByPhoneAndBusinessId(String phone, String businessId);
}
