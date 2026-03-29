package com.bukukasir.table.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.table.application.dto.*;
import com.bukukasir.table.application.mapper.TableMapper;
import com.bukukasir.table.domain.model.RestaurantTable;
import com.bukukasir.table.domain.model.TableStatus;
import com.bukukasir.table.domain.port.in.TableUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
@Tag(name = "Tables", description = "Table management endpoints")
public class TableController {

    private final TableUseCase tableUseCase;
    private final TableMapper tableMapper;

    @GetMapping
    @Operation(summary = "List all tables")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getAllTables(
            @RequestParam(required = false) String businessId) {
        List<TableResponse> responses = tableUseCase.getAllTables(businessId).stream()
                .map(tableMapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get table by ID")
    public ResponseEntity<ApiResponse<TableResponse>> getTableById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(tableMapper.toResponse(tableUseCase.getTableById(id))));
    }

    @PostMapping
    @Operation(summary = "Create table")
    public ResponseEntity<ApiResponse<TableResponse>> createTable(@Valid @RequestBody TableRequest request) {
        RestaurantTable table = tableMapper.toDomain(request);
        RestaurantTable created = tableUseCase.createTable(table);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(tableMapper.toResponse(created), "Table created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update table")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(@PathVariable String id, @Valid @RequestBody TableRequest request) {
        RestaurantTable table = tableMapper.toDomain(request);
        return ResponseEntity.ok(ApiResponse.success(tableMapper.toResponse(tableUseCase.updateTable(id, table)), "Table updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete table")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable String id) {
        tableUseCase.deleteTable(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Table deleted"));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update table status")
    public ResponseEntity<ApiResponse<TableResponse>> updateStatus(
            @PathVariable String id, @RequestBody Map<String, String> body) {
        TableStatus status = TableStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.success(tableMapper.toResponse(tableUseCase.updateStatus(id, status)), "Status updated"));
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transfer order between tables")
    public ResponseEntity<ApiResponse<Void>> transferTable(@Valid @RequestBody TransferTableRequest request) {
        tableUseCase.transferTable(request.fromTableId(), request.toTableId());
        return ResponseEntity.ok(ApiResponse.success(null, "Table transferred"));
    }

    @PostMapping("/merge")
    @Operation(summary = "Merge tables")
    public ResponseEntity<ApiResponse<TableResponse>> mergeTables(@Valid @RequestBody MergeTablesRequest request) {
        RestaurantTable merged = tableUseCase.mergeTables(request.tableIds(), request.targetTableId());
        return ResponseEntity.ok(ApiResponse.success(tableMapper.toResponse(merged), "Tables merged"));
    }
}
