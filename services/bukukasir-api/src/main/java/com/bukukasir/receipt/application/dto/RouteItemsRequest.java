package com.bukukasir.receipt.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Request to route order items to printers")
public record RouteItemsRequest(

    @NotBlank
    @Schema(description = "Business ID", example = "biz-001")
    String businessId,

    @NotEmpty
    @Schema(description = "Order items to route")
    List<OrderItemDto> items
) {

    @Schema(description = "Order item to route")
    public record OrderItemDto(
        @Schema(description = "Item ID", example = "item-001")
        String id,

        @Schema(description = "Item name", example = "Nasi Goreng")
        String name,

        @Schema(description = "Quantity", example = "2")
        int quantity,

        @Schema(description = "Price", example = "25000")
        BigDecimal price,

        @Schema(description = "Category ID", example = "cat-001")
        String categoryId,

        @Schema(description = "Item flags for routing", example = "[\"KITCHEN\"]")
        List<String> flags,

        @Schema(description = "Notes", example = "Extra spicy")
        String notes
    ) {}
}
