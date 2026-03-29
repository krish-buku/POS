package com.bukukasir.shift.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.shift.application.dto.*;
import com.bukukasir.shift.application.mapper.ShiftMapper;
import com.bukukasir.shift.domain.model.CashMovement;
import com.bukukasir.shift.domain.model.Shift;
import com.bukukasir.shift.domain.model.ZReport;
import com.bukukasir.shift.domain.port.in.ShiftUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
@Tag(name = "Shifts", description = "Shift management endpoints")
public class ShiftController {

    private final ShiftUseCase shiftUseCase;
    private final ShiftMapper shiftMapper;

    @PostMapping("/open")
    @Operation(summary = "Open a new shift", description = "Opens a new shift for a staff member. Only one open shift per staff per business allowed.")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Shift opened successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request or shift already open")
    })
    public ResponseEntity<ApiResponse<ShiftResponse>> openShift(@Valid @RequestBody OpenShiftRequest request) {
        Shift shift = shiftUseCase.openShift(
                request.staffId(), request.staffName(), request.businessId(), request.openingCash());
        ShiftResponse response = shiftMapper.toResponse(shift);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Shift opened successfully"));
    }

    @PostMapping("/{id}/close")
    @Operation(summary = "Close a shift", description = "Closes an open shift with actual cash count")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Shift closed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Shift is not open"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Shift not found")
    })
    public ResponseEntity<ApiResponse<ShiftResponse>> closeShift(
            @PathVariable String id,
            @Valid @RequestBody CloseShiftRequest request) {
        Shift shift = shiftUseCase.closeShift(id, request.closingCash(), request.notes());
        ShiftResponse response = shiftMapper.toResponse(shift);
        return ResponseEntity.ok(ApiResponse.success(response, "Shift closed successfully"));
    }

    @GetMapping("/current")
    @Operation(summary = "Get current open shift", description = "Gets the currently open shift for a staff member in a business")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Current shift found"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "No open shift found")
    })
    public ResponseEntity<ApiResponse<ShiftResponse>> getCurrentShift(
            @RequestParam String staffId,
            @RequestParam String businessId) {
        Shift shift = shiftUseCase.getCurrentShift(staffId, businessId);
        ShiftResponse response = shiftMapper.toResponse(shift);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shift details", description = "Returns details of a specific shift including cash movements")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Shift details retrieved"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Shift not found")
    })
    public ResponseEntity<ApiResponse<ShiftResponse>> getShift(@PathVariable String id) {
        Shift shift = shiftUseCase.getShiftById(id);
        ShiftResponse response = shiftMapper.toResponse(shift);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "List shifts", description = "Lists shifts for a business within an optional date range")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Shifts listed successfully")
    })
    public ResponseEntity<ApiResponse<List<ShiftResponse>>> listShifts(
            @RequestParam String businessId,
            @RequestParam(required = false) LocalDateTime dateFrom,
            @RequestParam(required = false) LocalDateTime dateTo) {
        List<Shift> shifts = shiftUseCase.listShifts(businessId, dateFrom, dateTo);
        List<ShiftResponse> responses = shifts.stream().map(shiftMapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/{id}/cash-movement")
    @Operation(summary = "Add cash movement", description = "Adds a cash-in or cash-out movement to an open shift")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Cash movement added"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Shift is not open"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Shift not found")
    })
    public ResponseEntity<ApiResponse<ShiftResponse.CashMovementResponse>> addCashMovement(
            @PathVariable String id,
            @Valid @RequestBody CashMovementRequest request) {
        CashMovement movement = shiftUseCase.addCashMovement(
                id, request.type(), request.amount(), request.reason(), request.staffId());
        ShiftResponse.CashMovementResponse response = new ShiftResponse.CashMovementResponse(
                movement.getId(), movement.getShiftId(), movement.getType().name(),
                movement.getAmount(), movement.getReason(), movement.getStaffId(), movement.getCreatedAt());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Cash movement added"));
    }

    @GetMapping("/{id}/z-report")
    @Operation(summary = "Generate Z-report", description = "Generates a Z-report summary for a shift")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Z-report generated"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Shift not found")
    })
    public ResponseEntity<ApiResponse<ZReport>> getZReport(@PathVariable String id) {
        ZReport report = shiftUseCase.generateZReport(id);
        return ResponseEntity.ok(ApiResponse.success(report, "Z-report generated"));
    }
}
