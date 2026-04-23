package com.bukukasir.kitchen.infrastructure.web;

import com.bukukasir.common.dto.ApiResponse;
import com.bukukasir.kitchen.domain.model.KitchenTicket;
import com.bukukasir.kitchen.domain.model.TicketStatus;
import com.bukukasir.kitchen.domain.port.in.KitchenUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kitchen")
@RequiredArgsConstructor
@Tag(name = "Kitchen", description = "Kitchen display system endpoints")
public class KitchenController {

    private final KitchenUseCase kitchenUseCase;

    @GetMapping("/tickets")
    @Operation(summary = "List all kitchen tickets, optionally filtered by business")
    public ResponseEntity<ApiResponse<List<KitchenTicket>>> getAllTickets(
            @RequestParam(required = false) String businessId) {
        List<KitchenTicket> all = kitchenUseCase.getAllTickets();
        if (businessId != null) {
            all = all.stream().filter(t -> businessId.equals(t.getBusinessId())).toList();
        }
        return ResponseEntity.ok(ApiResponse.success(all));
    }

    @GetMapping("/tickets/{id}")
    @Operation(summary = "Get ticket by ID")
    public ResponseEntity<ApiResponse<KitchenTicket>> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(kitchenUseCase.getTicketById(id)));
    }

    @PutMapping("/tickets/{id}/status")
    @Operation(summary = "Update ticket status")
    public ResponseEntity<ApiResponse<KitchenTicket>> updateTicketStatus(
            @PathVariable String id, @RequestBody Map<String, String> body) {
        TicketStatus status = TicketStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.success(kitchenUseCase.updateTicketStatus(id, status), "Status updated"));
    }

    @PostMapping("/tickets/{id}/reprint")
    @Operation(summary = "Reprint a kitchen ticket")
    public ResponseEntity<ApiResponse<KitchenTicket>> reprintTicket(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(kitchenUseCase.reprintTicket(id), "Ticket reprinted"));
    }
}
