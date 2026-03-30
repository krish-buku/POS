package com.bukukasir.business.domain.service;

import com.bukukasir.business.domain.model.Customer;
import com.bukukasir.business.domain.port.in.CustomerUseCase;
import com.bukukasir.business.domain.port.out.CustomerRepository;
import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerDomainService implements CustomerUseCase {

    private final CustomerRepository customerRepository;

    @Override
    public List<Customer> getCustomers(String businessId) {
        return customerRepository.findByBusinessId(businessId);
    }

    @Override
    public Customer getCustomerById(String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
    }

    @Override
    public Customer getCustomerByPhone(String phone, String businessId) {
        return customerRepository.findByPhoneAndBusinessId(phone, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "phone", phone));
    }

    @Override
    public Customer createCustomer(Customer customer) {
        customer.setId(IdGenerator.generateId());
        customer.setTotalOrders(0);
        customer.setTotalSpent(BigDecimal.ZERO);
        customer.setCreatedAt(Instant.now());
        customer.setUpdatedAt(Instant.now());
        return customerRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(String id, Customer customer) {
        Customer existing = getCustomerById(id);
        existing.setPhone(customer.getPhone());
        existing.setName(customer.getName());
        existing.setEmail(customer.getEmail());
        existing.setDateOfBirth(customer.getDateOfBirth());
        existing.setGender(customer.getGender());
        existing.setNotes(customer.getNotes());
        existing.setMarketingPreferences(customer.getMarketingPreferences());
        existing.setUpdatedAt(Instant.now());
        return customerRepository.save(existing);
    }

    @Override
    public void deleteCustomer(String id) {
        customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        customerRepository.deleteById(id);
    }

    @Override
    public Customer updateOrderStats(String id, int orderCount, BigDecimal totalSpent) {
        Customer existing = getCustomerById(id);
        existing.setTotalOrders(existing.getTotalOrders() + orderCount);
        existing.setTotalSpent(existing.getTotalSpent().add(totalSpent));
        existing.setLastOrderAt(Instant.now());
        existing.setUpdatedAt(Instant.now());
        return customerRepository.save(existing);
    }
}
