package com.bukukasir.business.infrastructure.web;

import com.bukukasir.business.application.dto.CustomerRequest;
import com.bukukasir.business.application.dto.CustomerResponse;
import com.bukukasir.business.application.dto.UpdateOrderStatsRequest;
import com.bukukasir.business.application.mapper.BusinessMapper;
import com.bukukasir.business.domain.model.Customer;
import com.bukukasir.business.domain.port.in.CustomerUseCase;
import com.bukukasir.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer profile management endpoints")
public class CustomerController {

    private final CustomerUseCase customerUseCase;
    private final BusinessMapper businessMapper;

    @GetMapping
    @Operation(summary = "List customers for a business")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Customers retrieved")
    })
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getCustomers(
            @Parameter(description = "Business ID") @RequestParam String businessId,
            @Parameter(description = "Optional search query for name or phone") @RequestParam(required = false, name = "q") String query) {
        String normalizedQuery = query == null ? "" : query.trim().toLowerCase();
        List<CustomerResponse> responses = customerUseCase.getCustomers(businessId).stream()
                .map(businessMapper::toCustomerResponse)
                .filter(customer -> normalizedQuery.isBlank()
                        || (customer.name() != null && customer.name().toLowerCase().contains(normalizedQuery))
                        || (customer.phone() != null && customer.phone().toLowerCase().contains(normalizedQuery)))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Customer found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Customer not found")
    })
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(
            @Parameter(description = "Customer ID") @PathVariable String id) {
        Customer customer = customerUseCase.getCustomerById(id);
        return ResponseEntity.ok(ApiResponse.success(businessMapper.toCustomerResponse(customer)));
    }

    @GetMapping("/phone/{phone}")
    @Operation(summary = "Look up customer by phone number (for cashier quick-lookup)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Customer found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Customer not found")
    })
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerByPhone(
            @Parameter(description = "Phone number in +62 format") @PathVariable String phone,
            @Parameter(description = "Business ID") @RequestParam String businessId) {
        Customer customer = customerUseCase.getCustomerByPhone(phone, businessId);
        return ResponseEntity.ok(ApiResponse.success(businessMapper.toCustomerResponse(customer)));
    }

    @PostMapping
    @Operation(summary = "Create a customer")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Customer created")
    })
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            @Valid @RequestBody CustomerRequest request) {
        Customer customer = businessMapper.toCustomerDomain(request);
        Customer created = customerUseCase.createCustomer(customer);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(businessMapper.toCustomerResponse(created), "Customer created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a customer")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Customer updated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Customer not found")
    })
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @Parameter(description = "Customer ID") @PathVariable String id,
            @Valid @RequestBody CustomerRequest request) {
        Customer customer = businessMapper.toCustomerDomain(request);
        Customer updated = customerUseCase.updateCustomer(id, customer);
        return ResponseEntity.ok(ApiResponse.success(businessMapper.toCustomerResponse(updated), "Customer updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a customer")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Customer deleted"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Customer not found")
    })
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(
            @Parameter(description = "Customer ID") @PathVariable String id) {
        customerUseCase.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Customer deleted"));
    }

    @PutMapping("/{id}/order-stats")
    @Operation(summary = "Update customer order stats (called when order is completed)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Order stats updated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Customer not found")
    })
    public ResponseEntity<ApiResponse<CustomerResponse>> updateOrderStats(
            @Parameter(description = "Customer ID") @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatsRequest request) {
        Customer updated = customerUseCase.updateOrderStats(id, request.orderCount(), request.totalSpent());
        return ResponseEntity.ok(ApiResponse.success(businessMapper.toCustomerResponse(updated), "Order stats updated"));
    }
}
