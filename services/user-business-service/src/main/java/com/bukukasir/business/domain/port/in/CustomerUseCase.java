package com.bukukasir.business.domain.port.in;

import com.bukukasir.business.domain.model.Customer;

import java.math.BigDecimal;
import java.util.List;

public interface CustomerUseCase {
    List<Customer> getCustomers(String businessId);
    Customer getCustomerById(String id);
    Customer getCustomerByPhone(String phone, String businessId);
    Customer createCustomer(Customer customer);
    Customer updateCustomer(String id, Customer customer);
    void deleteCustomer(String id);
    Customer updateOrderStats(String id, int orderCount, BigDecimal totalSpent);
}
