package com.bukukasir.business.infrastructure.web;

import com.bukukasir.business.application.dto.*;
import com.bukukasir.business.application.mapper.BusinessMapper;
import com.bukukasir.business.domain.model.Business;
import com.bukukasir.business.domain.model.OwnershipTransfer;
import com.bukukasir.business.domain.port.in.BusinessUseCase;
import com.bukukasir.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/businesses")
@RequiredArgsConstructor
@Tag(name = "Business", description = "Business management endpoints")
public class BusinessController {

    private final BusinessUseCase businessUseCase;
    private final BusinessMapper businessMapper;

    @GetMapping
    @Operation(summary = "List all businesses", description = "Returns all businesses")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Businesses retrieved")
    })
    public ResponseEntity<ApiResponse<List<BusinessResponse>>> getAllBusinesses() {
        List<BusinessResponse> responses = businessUseCase.getAllBusinesses().stream()
                .map(businessMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get business by ID", description = "Returns a specific business")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Business found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Business not found")
    })
    public ResponseEntity<ApiResponse<BusinessResponse>> getBusinessById(@PathVariable String id) {
        Business business = businessUseCase.getBusinessById(id);
        return ResponseEntity.ok(ApiResponse.success(businessMapper.toResponse(business)));
    }

    @PostMapping
    @Operation(summary = "Create a business", description = "Creates a new business")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Business created")
    })
    public ResponseEntity<ApiResponse<BusinessResponse>> createBusiness(
            @Valid @RequestBody BusinessRequest request) {
        Business business = businessMapper.toDomain(request);
        Business created = businessUseCase.createBusiness(business);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(businessMapper.toResponse(created), "Business created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a business", description = "Updates an existing business")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Business updated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Business not found")
    })
    public ResponseEntity<ApiResponse<BusinessResponse>> updateBusiness(
            @PathVariable String id,
            @Valid @RequestBody BusinessRequest request) {
        Business business = businessMapper.toDomain(request);
        Business updated = businessUseCase.updateBusiness(id, business);
        return ResponseEntity.ok(ApiResponse.success(businessMapper.toResponse(updated), "Business updated"));
    }

    @PostMapping("/transfer-ownership")
    @Operation(summary = "Transfer business ownership", description = "Transfers ownership of a business to another user")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Ownership transferred")
    })
    public ResponseEntity<ApiResponse<OwnershipTransfer>> transferOwnership(
            @Valid @RequestBody TransferOwnershipRequest request) {
        OwnershipTransfer transfer = businessUseCase.transferOwnership(
                request.businessId(), request.fromOwnerId(), request.toOwnerId());
        return ResponseEntity.ok(ApiResponse.success(transfer, "Ownership transferred"));
    }
}
