package com.bukukasir.receipt.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "printers")
public class PrinterEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String businessId;

    @Column(nullable = false)
    private String name;

    private String type;
    private String connectionType;
    private String ipAddress;
    private Integer port;
    private String macAddress;
    private String paperWidth;
    private boolean hasCutter;
    private boolean hasCashDrawer;
    @Column(name = "is_default")
    private boolean isDefault;
    @Column(name = "is_active")
    private boolean isActive;
}
