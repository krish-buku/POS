package com.bukukasir.auth.infrastructure.web;

import com.bukukasir.auth.application.dto.*;
import com.bukukasir.auth.application.mapper.AuthMapper;
import com.bukukasir.auth.domain.model.Role;
import com.bukukasir.auth.domain.model.Session;
import com.bukukasir.auth.domain.port.in.ChangePinUseCase;
import com.bukukasir.auth.domain.port.in.ResetPinUseCase;
import com.bukukasir.auth.domain.port.in.VerifyPinUseCase;
import com.bukukasir.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "PIN-based authentication endpoints")
public class AuthController {

    private final VerifyPinUseCase verifyPinUseCase;
    private final ChangePinUseCase changePinUseCase;
    private final ResetPinUseCase resetPinUseCase;
    private final AuthMapper authMapper;

    @PostMapping("/verify-pin")
    @Operation(summary = "Verify staff PIN", description = "Authenticates a staff member using their PIN and returns a session")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "PIN verified successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid PIN"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Authentication failed")
    })
    public ResponseEntity<ApiResponse<AuthResponse>> verifyPin(@Valid @RequestBody VerifyPinRequest request) {
        Session session = verifyPinUseCase.verifyPin(request.businessId(), request.pin());
        AuthResponse response = authMapper.toResponse(session);
        return ResponseEntity.ok(ApiResponse.success(response, "PIN verified successfully"));
    }

    @PostMapping("/change-pin")
    @Operation(summary = "Change staff PIN", description = "Changes a staff member's PIN (requires current PIN)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "PIN changed successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid current PIN or new PIN format")
    })
    public ResponseEntity<ApiResponse<Void>> changePin(@Valid @RequestBody ChangePinRequest request) {
        changePinUseCase.changePin(request.staffId(), request.currentPin(), request.newPin());
        return ResponseEntity.ok(ApiResponse.success(null, "PIN changed successfully"));
    }

    @PostMapping("/reset-pin")
    @Operation(summary = "Reset staff PIN", description = "Resets a staff member's PIN (manager action)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "PIN reset successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Unauthorized - only managers can reset PINs")
    })
    public ResponseEntity<ApiResponse<Map<String, String>>> resetPin(@Valid @RequestBody ResetPinRequest request) {
        String newPin = resetPinUseCase.resetPin(request.staffId(), request.managerStaffId());
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("newPin", newPin, "staffId", request.staffId()),
                "PIN reset successfully"));
    }

    @GetMapping("/session")
    @Operation(summary = "Get current session", description = "Returns the current session information (mock: returns a default session)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Session retrieved successfully")
    })
    public ResponseEntity<ApiResponse<AuthResponse>> getSession(
            @RequestParam(defaultValue = "staff-001") String staffId) {
        // Mock: create a session for the requested staff
        Session session = verifyPinUseCase.verifyPin("biz-001", "1234");
        AuthResponse response = authMapper.toResponse(session);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/roles")
    @Operation(summary = "List available roles", description = "Returns all available staff roles")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Roles listed successfully")
    })
    public ResponseEntity<ApiResponse<List<String>>> listRoles() {
        List<String> roles = Arrays.stream(Role.values())
                .map(Role::name)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(roles, "Roles retrieved successfully"));
    }
}
