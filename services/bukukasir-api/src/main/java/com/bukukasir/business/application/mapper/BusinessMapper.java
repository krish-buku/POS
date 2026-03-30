package com.bukukasir.business.application.mapper;

import com.bukukasir.business.application.dto.*;
import com.bukukasir.business.domain.model.*;
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

    public CustomerResponse toCustomerResponse(Customer c) {
        return new CustomerResponse(
                c.getId(), c.getBusinessId(), c.getPhone(), c.getName(),
                c.getEmail(), c.getDateOfBirth(),
                c.getGender() != null ? c.getGender().name() : null,
                c.getNotes(), c.getTotalOrders(), c.getTotalSpent(),
                c.getLastOrderAt(), c.getMarketingPreferences(),
                c.getCreatedAt(), c.getUpdatedAt()
        );
    }

    public Customer toCustomerDomain(CustomerRequest r) {
        MarketingPreferences prefs = MarketingPreferences.builder()
                .smsOptIn(true).emailOptIn(true).whatsappOptIn(true).build();
        if (r.marketingPreferences() != null) {
            prefs = MarketingPreferences.builder()
                    .smsOptIn(r.marketingPreferences().smsOptIn())
                    .emailOptIn(r.marketingPreferences().emailOptIn())
                    .whatsappOptIn(r.marketingPreferences().whatsappOptIn())
                    .build();
        }
        return Customer.builder()
                .businessId(r.businessId())
                .phone(r.phone())
                .name(r.name())
                .email(r.email())
                .dateOfBirth(r.dateOfBirth())
                .gender(r.gender() != null ? Gender.valueOf(r.gender()) : Gender.UNSPECIFIED)
                .notes(r.notes())
                .marketingPreferences(prefs)
                .build();
    }
}
