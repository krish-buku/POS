package com.bukukasir.auth.domain.service;

import com.bukukasir.auth.domain.model.Pin;
import com.bukukasir.auth.domain.model.Session;
import com.bukukasir.auth.domain.port.in.ChangePinUseCase;
import com.bukukasir.auth.domain.port.in.ResetPinUseCase;
import com.bukukasir.auth.domain.port.in.VerifyPinUseCase;
import com.bukukasir.auth.domain.port.out.PinRepository;
import com.bukukasir.auth.domain.port.out.SessionRepository;
import com.bukukasir.common.exception.BusinessException;
import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthDomainService implements VerifyPinUseCase, ChangePinUseCase, ResetPinUseCase {

    private final PinRepository pinRepository;
    private final SessionRepository sessionRepository;

    @Override
    public Session verifyPin(String businessId, String pin) {
        String hashedPin = Pin.hashPin(pin);
        Pin staffPin = pinRepository.findByBusinessIdAndHashedPin(businessId, hashedPin)
                .orElseThrow(() -> new BusinessException("INVALID_PIN", "Invalid PIN"));

        if (!staffPin.isActive()) {
            throw new BusinessException("ACCOUNT_DISABLED", "This account is disabled");
        }

        Session session = Session.builder()
                .sessionId(IdGenerator.generateId())
                .staffId(staffPin.getStaffId())
                .staffName(staffPin.getStaffName())
                .role(staffPin.getRole())
                .businessId(businessId)
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plus(8, ChronoUnit.HOURS))
                .active(true)
                .build();

        return sessionRepository.save(session);
    }

    @Override
    public void changePin(String staffId, String currentPin, String newPin) {
        Pin pin = pinRepository.findByStaffId(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));

        if (!pin.verifyPin(currentPin)) {
            throw new BusinessException("INVALID_PIN", "Current PIN is incorrect");
        }

        if (newPin.length() != 4 && newPin.length() != 6) {
            throw new BusinessException("INVALID_PIN_FORMAT", "PIN must be 4 or 6 digits");
        }

        pin.setHashedPin(Pin.hashPin(newPin));
        pinRepository.save(pin);
    }

    @Override
    public String resetPin(String staffId, String managerStaffId) {
        Pin managerPin = pinRepository.findByStaffId(managerStaffId)
                .orElseThrow(() -> new ResourceNotFoundException("Manager", "id", managerStaffId));

        if (managerPin.getRole().ordinal() > 1) { // Only OWNER or MANAGER can reset
            throw new BusinessException("UNAUTHORIZED", "Only managers can reset PINs");
        }

        Pin pin = pinRepository.findByStaffId(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", staffId));

        String newPin = String.format("%04d", new Random().nextInt(10000));
        pin.setHashedPin(Pin.hashPin(newPin));
        pinRepository.save(pin);

        return newPin;
    }
}
