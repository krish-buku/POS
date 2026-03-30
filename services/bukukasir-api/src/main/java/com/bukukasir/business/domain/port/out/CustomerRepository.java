package com.bukukasir.business.domain.port.out;

import com.bukukasir.business.domain.model.Customer;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository {
    List<Customer> findByBusinessId(String businessId);
    Optional<Customer> findById(String id);
    Optional<Customer> findByPhoneAndBusinessId(String phone, String businessId);
    Customer save(Customer customer);
    void deleteById(String id);
}
