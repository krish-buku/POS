package com.bukukasir.business.application.mapper;

import com.bukukasir.business.application.dto.BusinessRequest;
import com.bukukasir.business.application.dto.BusinessResponse;
import com.bukukasir.business.domain.model.Business;
import org.springframework.stereotype.Component;

@Component
public class BusinessMapper {

    public BusinessResponse toResponse(Business business) {
        return new BusinessResponse(
                business.getId(),
                business.getName(),
                business.getType(),
                business.getAddress(),
                business.getPhone(),
                business.getOwnerId(),
                business.getLogoUrl(),
                business.getCurrency(),
                business.getTimezone(),
                business.isActive(),
                business.getCreatedAt(),
                business.getUpdatedAt()
        );
    }

    public Business toDomain(BusinessRequest request) {
        return Business.builder()
                .name(request.name())
                .type(request.type())
                .address(request.address())
                .phone(request.phone())
                .ownerId(request.ownerId())
                .logoUrl(request.logoUrl())
                .currency("IDR")
                .timezone("Asia/Jakarta")
                .build();
    }
}
