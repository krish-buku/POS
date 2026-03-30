package com.bukukasir.auth.infrastructure.persistence.adapter;

import com.bukukasir.auth.domain.model.Pin;
import com.bukukasir.auth.domain.model.Role;
import com.bukukasir.auth.domain.port.out.PinRepository;
import com.bukukasir.auth.infrastructure.persistence.entity.PinEntity;
import com.bukukasir.auth.infrastructure.persistence.repository.JpaPinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PinPersistenceAdapter implements PinRepository {

    private final JpaPinRepository jpaPinRepository;

    @Override
    public Optional<Pin> findByStaffId(String staffId) {
        return jpaPinRepository.findByStaffId(staffId).map(this::toDomain);
    }

    @Override
    public Optional<Pin> findByBusinessIdAndHashedPin(String businessId, String hashedPin) {
        return jpaPinRepository.findFirstByBusinessIdAndHashedPin(businessId, hashedPin).map(this::toDomain);
    }

    @Override
    public List<Pin> findByBusinessId(String businessId) {
        return jpaPinRepository.findByBusinessId(businessId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Pin save(Pin pin) {
        PinEntity entity = toEntity(pin);
        jpaPinRepository.save(entity);
        return pin;
    }

    private Pin toDomain(PinEntity entity) {
        return Pin.builder()
                .staffId(entity.getStaffId())
                .staffName(entity.getStaffName())
                .hashedPin(entity.getHashedPin())
                .role(Role.valueOf(entity.getRole().toUpperCase()))
                .businessId(entity.getBusinessId())
                .active(entity.isActive())
                .build();
    }

    private PinEntity toEntity(Pin pin) {
        return PinEntity.builder()
                .staffId(pin.getStaffId())
                .staffName(pin.getStaffName())
                .hashedPin(pin.getHashedPin())
                .role(pin.getRole().name())
                .businessId(pin.getBusinessId())
                .active(pin.isActive())
                .build();
    }
}
