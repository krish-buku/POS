package com.bukukasir.receipt.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Printer {

    private String id;
    private String businessId;
    private String name;
    private PrinterType type;
    private ConnectionType connectionType;
    private String ipAddress;
    private Integer port;
    private String macAddress;
    private PaperWidth paperWidth;
    private boolean hasCutter;
    private boolean hasCashDrawer;
    private boolean isDefault;
    private boolean isActive;
}
