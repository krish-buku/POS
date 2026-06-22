package com.bukukasir.order.infrastructure.web;

import com.bukukasir.common.audit.AuditLogDTO;
import com.bukukasir.common.audit.AuditLogger;
import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.order.application.dto.*;
import com.bukukasir.order.application.mapper.OrderMapper;
import com.bukukasir.order.domain.model.Order;
import com.bukukasir.order.domain.model.OrderItem;
import com.bukukasir.order.domain.port.in.OrderUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {

    private final OrderUseCase orderUseCase;
    private final OrderMapper orderMapper;
    private final AuditLogger auditLogger;

    @PostMapping
    @Operation(summary = "Create a new order")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Order order = orderMapper.toDomain(request);
        Order created = orderUseCase.createOrder(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(orderMapper.toResponse(created), "Order created"));
    }

    @GetMapping
    @Operation(summary = "List all orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        List<OrderResponse> responses = orderUseCase.getAllOrders().stream().map(orderMapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(orderMapper.toResponse(orderUseCase.getOrderById(id))));
    }

    @GetMapping("/table/{tableId}")
    @Operation(summary = "Get orders by table")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByTable(@PathVariable String tableId) {
        List<OrderResponse> responses = orderUseCase.getOrdersByTableId(tableId).stream().map(orderMapper::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/{id}/items")
    @Operation(summary = "Add items to an existing order")
    public ResponseEntity<ApiResponse<OrderResponse>> addItems(
            @PathVariable String id,
            @Valid @RequestBody List<CreateOrderRequest.OrderItemRequest> items) {
        List<OrderItem> orderItems = orderMapper.toOrderItems(items);
        Order updated = orderUseCase.addItems(id, orderItems);
        return ResponseEntity.ok(ApiResponse.success(orderMapper.toResponse(updated), "Items added"));
    }

    @PostMapping("/{id}/void")
    @Operation(summary = "Void an order")
    public ResponseEntity<ApiResponse<OrderResponse>> voidOrder(
            @PathVariable String id, @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "No reason provided");
        Order voided = orderUseCase.voidOrder(id, reason);
        return ResponseEntity.ok(ApiResponse.success(orderMapper.toResponse(voided), "Order voided"));
    }

    @PostMapping("/{id}/paid")
    @Operation(summary = "Mark an order as paid")
    public ResponseEntity<ApiResponse<OrderResponse>> markOrderPaid(
            @PathVariable String id, @RequestBody(required = false) Map<String, String> body) {
        String paymentMethodName = body != null ? body.getOrDefault("paymentMethodName", "Manual") : "Manual";
        Order paid = orderUseCase.markOrderPaid(id, paymentMethodName);
        return ResponseEntity.ok(ApiResponse.success(orderMapper.toResponse(paid), "Order paid"));
    }

    @GetMapping("/audit")
    @Operation(summary = "Query order audit logs", description = "Returns audit trail for order-related actions")
    @io.swagger.v3.oas.annotations.responses.ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Audit logs retrieved")
    })
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getAuditLogs(
            @RequestParam(required = false) String businessId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "50") int limit) {
        List<AuditLogDTO> logs = auditLogger.query(businessId, "Order", null, from, to, limit)
                .stream().map(AuditLogDTO::from).toList();
        return ResponseEntity.ok(ApiResponse.success(logs, "Audit logs retrieved"));
    }
}
