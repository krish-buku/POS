package com.bukukasir.auth.application.mapper;

import com.bukukasir.auth.application.dto.AuthResponse;
import com.bukukasir.auth.domain.model.Session;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {

    public AuthResponse toResponse(Session session) {
        return new AuthResponse(
                session.getSessionId(),
                session.getStaffId(),
                session.getStaffName(),
                session.getRole().name(),
                session.getBusinessId(),
                session.getExpiresAt()
        );
    }
}
