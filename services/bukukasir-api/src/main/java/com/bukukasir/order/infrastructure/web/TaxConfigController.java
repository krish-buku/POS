package com.bukukasir.order.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.order.application.dto.TaxConfigRequest;
import com.bukukasir.order.application.mapper.OrderMapper;
import com.bukukasir.order.domain.model.TaxConfig;
import com.bukukasir.order.domain.port.in.TaxConfigUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders/tax-config")
@RequiredArgsConstructor
@Tag(name = "Tax Configuration", description = "Tax configuration management endpoints")
public class TaxConfigController {

    private final TaxConfigUseCase taxConfigUseCase;
    private final OrderMapper orderMapper;

    @GetMapping
    @Operation(summary = "Get active tax configs for a business")
    public ResponseEntity<ApiResponse<List<TaxConfig>>> getTaxConfigs(
            @Parameter(description = "Business ID") @RequestParam String businessId) {
        return ResponseEntity.ok(ApiResponse.success(taxConfigUseCase.getTaxConfigs(businessId)));
    }

    @PostMapping
    @Operation(summary = "Create a tax configuration")
    public ResponseEntity<ApiResponse<TaxConfig>> createTaxConfig(
            @Valid @RequestBody TaxConfigRequest request) {
        TaxConfig taxConfig = orderMapper.toDomain(request);
        TaxConfig created = taxConfigUseCase.createTaxConfig(taxConfig);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Tax configuration created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a tax configuration")
    public ResponseEntity<ApiResponse<TaxConfig>> updateTaxConfig(
            @Parameter(description = "Tax config ID") @PathVariable String id,
            @Valid @RequestBody TaxConfigRequest request) {
        TaxConfig taxConfig = orderMapper.toDomain(request);
        TaxConfig updated = taxConfigUseCase.updateTaxConfig(id, taxConfig);
        return ResponseEntity.ok(ApiResponse.success(updated, "Tax configuration updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a tax configuration")
    public ResponseEntity<ApiResponse<Void>> deleteTaxConfig(
            @Parameter(description = "Tax config ID") @PathVariable String id) {
        taxConfigUseCase.deleteTaxConfig(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Tax configuration deleted"));
    }
}
