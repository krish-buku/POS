package com.bukukasir.payment.domain.model;

public enum LineType {
    ORDER_ITEM,        // individual item charge
    MODIFIER,          // modifier charge
    DISCOUNT_ITEM,     // item-level discount (negative)
    DISCOUNT_ORDER,    // order-level discount (negative)
    SERVICE_CHARGE,    // PB1/service charge
    TAX_PPN,           // PPN tax
    TAX_PB1,           // PB1 tax (if separate from service charge)
    PACKAGING_FEE,     // packaging fee
    DELIVERY_FEE,      // delivery fee
    CUSTOM_FEE,        // custom additional fee
    ROUNDING,          // rounding adjustment
    VOID_REVERSAL      // reversal entry when order is voided (negative of original)
}
