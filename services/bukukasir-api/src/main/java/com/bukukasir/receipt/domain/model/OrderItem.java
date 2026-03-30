package com.bukukasir.receipt.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    private String id;
    private String name;
    private int quantity;
    private BigDecimal price;
    private String categoryId;
    private List<String> flags;
    private String notes;
}
