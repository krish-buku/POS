package com.bukukasir.order.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Create order request")
public record CreateOrderRequest(
    @Schema(example = "table-001") String tableId,
    @Schema(example = "T1") String tableName,
    @NotBlank @Schema(example = "staff-003") String staffId,
    @Schema(example = "Ahmad Wijaya") String staffName,
    @Schema(example = "biz-001") String businessId,
    @NotEmpty List<OrderItemRequest> items,
    @Schema(description = "Order notes") String notes
) {
    @Schema(description = "Order item request")
    public record OrderItemRequest(
        @NotBlank String menuItemId,
        @NotBlank String menuItemName,
        int quantity,
        BigDecimal unitPrice,
        String notes,
        List<String> modifiers,
        String variantName
    ) {}
}
