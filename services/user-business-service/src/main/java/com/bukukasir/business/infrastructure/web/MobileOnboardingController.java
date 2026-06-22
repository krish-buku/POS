package com.bukukasir.business.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.common.util.IdGenerator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/businesses/onboarding")
@Tag(name = "Mobile onboarding", description = "Mobile first-run business setup payload")
public class MobileOnboardingController {

    @PostMapping
    @Operation(summary = "Save mobile onboarding setup")
    public ResponseEntity<ApiResponse<OnboardingResponse>> saveOnboarding(
            @Valid @RequestBody OnboardingRequest request) {
        String businessId = request.businessId() == null || request.businessId().isBlank()
                ? IdGenerator.generateId()
                : request.businessId();
        OnboardingResponse response = new OnboardingResponse(
                businessId,
                request.businessName(),
                request.taxEnabled(),
                request.serviceFeePercent(),
                request.tableCount(),
                request.menuSeed(),
                request.staffInvites(),
                "SAVED",
                Instant.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Onboarding setup saved"));
    }

    public record OnboardingRequest(
            String businessId,
            @NotBlank String businessName,
            boolean taxEnabled,
            int serviceFeePercent,
            int tableCount,
            @NotNull List<String> menuSeed,
            @NotNull List<String> staffInvites
    ) {}

    public record OnboardingResponse(
            String id,
            String businessName,
            boolean taxEnabled,
            int serviceFeePercent,
            int tableCount,
            List<String> menuSeed,
            List<String> staffInvites,
            String status,
            Instant createdAt
    ) {}
}
