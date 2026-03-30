package com.bukukasir.staff.application.mapper;

import com.bukukasir.staff.application.dto.StaffRequest;
import com.bukukasir.staff.application.dto.StaffResponse;
import com.bukukasir.staff.domain.model.Permission;
import com.bukukasir.staff.domain.model.Staff;
import com.bukukasir.staff.domain.model.StaffRole;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class StaffMapper {

    public StaffResponse toResponse(Staff staff) {
        Set<String> perms = staff.getPermissions() != null
                ? staff.getPermissions().stream().map(Permission::name).collect(Collectors.toSet())
                : Collections.emptySet();
        return new StaffResponse(
                staff.getId(), staff.getName(), staff.getEmail(), staff.getPhone(),
                staff.getRole().name(), staff.getBusinessId(), perms,
                staff.isActive(), staff.getCreatedAt(), staff.getUpdatedAt()
        );
    }

    public Staff toDomain(StaffRequest request) {
        Set<Permission> perms = request.permissions() != null
                ? request.permissions().stream().map(Permission::valueOf).collect(Collectors.toSet())
                : Collections.emptySet();
        return Staff.builder()
                .name(request.name())
                .email(request.email())
                .phone(request.phone())
                .role(StaffRole.valueOf(request.role()))
                .businessId(request.businessId())
                .pin(request.pin())
                .permissions(perms)
                .active(request.active())
                .build();
    }
}
