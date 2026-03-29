package com.bukukasir.auth.infrastructure.persistence.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PinEntity {

    private String staffId;
    private String staffName;
    private String hashedPin;
    private String role;
    private String businessId;
    private boolean active;
}
