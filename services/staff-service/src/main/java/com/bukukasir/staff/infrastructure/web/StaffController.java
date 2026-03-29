package com.bukukasir.staff.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.staff.application.dto.StaffRequest;
import com.bukukasir.staff.application.dto.StaffResponse;
import com.bukukasir.staff.application.mapper.StaffMapper;
import com.bukukasir.staff.domain.model.Staff;
import com.bukukasir.staff.domain.port.in.StaffUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@Tag(name = "Staff", description = "Staff management endpoints")
public class StaffController {

    private final StaffUseCase staffUseCase;
    private final StaffMapper staffMapper;

    @GetMapping
    @Operation(summary = "List all staff", description = "Returns all staff members, optionally filtered by business")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Staff retrieved")
    })
    public ResponseEntity<ApiResponse<List<StaffResponse>>> getAllStaff(
            @RequestParam(required = false) String businessId) {
        List<StaffResponse> responses = staffUseCase.getAllStaff(businessId).stream()
                .map(staffMapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get staff by ID", description = "Returns a specific staff member")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Staff found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Staff not found")
    })
    public ResponseEntity<ApiResponse<StaffResponse>> getStaffById(@PathVariable String id) {
        Staff staff = staffUseCase.getStaffById(id);
        return ResponseEntity.ok(ApiResponse.success(staffMapper.toResponse(staff)));
    }

    @PostMapping
    @Operation(summary = "Create staff", description = "Creates a new staff member")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Staff created")
    })
    public ResponseEntity<ApiResponse<StaffResponse>> createStaff(@Valid @RequestBody StaffRequest request) {
        Staff staff = staffMapper.toDomain(request);
        Staff created = staffUseCase.createStaff(staff);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(staffMapper.toResponse(created), "Staff created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update staff", description = "Updates an existing staff member")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Staff updated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Staff not found")
    })
    public ResponseEntity<ApiResponse<StaffResponse>> updateStaff(
            @PathVariable String id, @Valid @RequestBody StaffRequest request) {
        Staff staff = staffMapper.toDomain(request);
        Staff updated = staffUseCase.updateStaff(id, staff);
        return ResponseEntity.ok(ApiResponse.success(staffMapper.toResponse(updated), "Staff updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete staff", description = "Deletes a staff member")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Staff deleted"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Staff not found")
    })
    public ResponseEntity<ApiResponse<Void>> deleteStaff(@PathVariable String id) {
        staffUseCase.deleteStaff(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Staff deleted"));
    }

    @PostMapping("/{id}/reset-pin")
    @Operation(summary = "Reset staff PIN", description = "Resets a staff member's PIN and returns the new one")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "PIN reset"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Staff not found")
    })
    public ResponseEntity<ApiResponse<Map<String, String>>> resetPin(@PathVariable String id) {
        String newPin = staffUseCase.resetPin(id);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("staffId", id, "newPin", newPin), "PIN reset successfully"));
    }
}
