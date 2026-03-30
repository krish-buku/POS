package com.bukukasir.order.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.order.application.dto.CalculatePromotionRequest;
import com.bukukasir.order.application.dto.PromotionRequest;
import com.bukukasir.order.application.mapper.OrderMapper;
import com.bukukasir.order.domain.model.AppliedPromotion;
import com.bukukasir.order.domain.model.OrderItemInfo;
import com.bukukasir.order.domain.model.Promotion;
import com.bukukasir.order.domain.port.in.PromotionUseCase;
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
@RequestMapping("/api/orders/promotions")
@RequiredArgsConstructor
@Tag(name = "Promotions", description = "Promotion/discount engine endpoints")
public class PromotionController {

    private final PromotionUseCase promotionUseCase;
    private final OrderMapper orderMapper;

    @GetMapping
    @Operation(summary = "List promotions for a business")
    public ResponseEntity<ApiResponse<List<Promotion>>> getPromotions(
            @Parameter(description = "Business ID") @RequestParam String businessId) {
        return ResponseEntity.ok(ApiResponse.success(promotionUseCase.getPromotions(businessId)));
    }

    @PostMapping
    @Operation(summary = "Create a promotion")
    public ResponseEntity<ApiResponse<Promotion>> createPromotion(
            @Valid @RequestBody PromotionRequest request) {
        Promotion promotion = orderMapper.toDomain(request);
        Promotion created = promotionUseCase.createPromotion(promotion);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Promotion created"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a promotion")
    public ResponseEntity<ApiResponse<Promotion>> updatePromotion(
            @Parameter(description = "Promotion ID") @PathVariable String id,
            @Valid @RequestBody PromotionRequest request) {
        Promotion promotion = orderMapper.toDomain(request);
        Promotion updated = promotionUseCase.updatePromotion(id, promotion);
        return ResponseEntity.ok(ApiResponse.success(updated, "Promotion updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a promotion")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(
            @Parameter(description = "Promotion ID") @PathVariable String id) {
        promotionUseCase.deletePromotion(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Promotion deleted"));
    }

    @GetMapping("/active")
    @Operation(summary = "Get currently active promotions for a business")
    public ResponseEntity<ApiResponse<List<Promotion>>> getActivePromotions(
            @Parameter(description = "Business ID") @RequestParam String businessId) {
        return ResponseEntity.ok(ApiResponse.success(promotionUseCase.getActivePromotions(businessId)));
    }

    @PostMapping("/calculate")
    @Operation(summary = "Calculate promotions for given items/subtotal (preview)")
    public ResponseEntity<ApiResponse<List<AppliedPromotion>>> calculatePromotions(
            @Valid @RequestBody CalculatePromotionRequest request) {
        List<OrderItemInfo> items = orderMapper.toOrderItemInfos(request.items());
        List<AppliedPromotion> applied = promotionUseCase.calculatePromotions(
                request.businessId(), request.subtotal(), items);
        return ResponseEntity.ok(ApiResponse.success(applied, "Promotions calculated"));
    }
}
