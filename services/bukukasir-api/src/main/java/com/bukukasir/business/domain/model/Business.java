package com.bukukasir.business.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Business {

    private String id;
    private String name;
    private String type;
    private String address;
    private String phone;
    private String ownerId;
    private String logoUrl;
    private String currency;
    private String timezone;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
