package com.bukukasir.staff.domain.service;

import com.bukukasir.common.audit.AuditAction;
import com.bukukasir.common.audit.AuditLog;
import com.bukukasir.common.audit.AuditLogger;
import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.staff.domain.model.Staff;
import com.bukukasir.staff.domain.port.in.StaffUseCase;
import com.bukukasir.staff.domain.port.out.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class StaffDomainService implements StaffUseCase {

    private final StaffRepository staffRepository;
    private final AuditLogger auditLogger;

    @Override
    public List<Staff> getAllStaff(String businessId) {
        if (businessId != null && !businessId.isBlank()) {
            return staffRepository.findByBusinessId(businessId);
        }
        return staffRepository.findAll();
    }

    @Override
    public Staff getStaffById(String id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", id));
    }

    @Override
    public Staff createStaff(Staff staff) {
        staff.setId(IdGenerator.generateId());
        staff.setActive(true);
        staff.setCreatedAt(Instant.now());
        staff.setUpdatedAt(Instant.now());
        if (staff.getPin() == null) {
            staff.setPin(String.format("%04d", new Random().nextInt(10000)));
        }
        Staff saved = staffRepository.save(staff);

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(saved.getBusinessId())
                .action(AuditAction.CREATE)
                .entityType("Staff").entityId(saved.getId())
                .description("Created staff member: " + saved.getName() + " (" + saved.getRole() + ")")
                .newValues(staffToMap(saved))
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    @Override
    public Staff updateStaff(String id, Staff staff) {
        Staff existing = getStaffById(id);
        Map<String, Object> oldValues = staffToMap(existing);

        existing.setName(staff.getName());
        existing.setEmail(staff.getEmail());
        existing.setPhone(staff.getPhone());
        existing.setRole(staff.getRole());
        existing.setPermissions(staff.getPermissions());
        existing.setActive(staff.isActive());
        existing.setUpdatedAt(Instant.now());
        Staff saved = staffRepository.save(existing);

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(saved.getBusinessId())
                .action(AuditAction.UPDATE)
                .entityType("Staff").entityId(saved.getId())
                .description("Updated staff member: " + saved.getName())
                .oldValues(oldValues)
                .newValues(staffToMap(saved))
                .timestamp(LocalDateTime.now())
                .build());

        return saved;
    }

    @Override
    public void deleteStaff(String id) {
        getStaffById(id); // verify exists
        staffRepository.deleteById(id);
    }

    @Override
    public String resetPin(String staffId) {
        Staff staff = getStaffById(staffId);
        String newPin = String.format("%04d", new Random().nextInt(10000));
        staff.setPin(newPin);
        staff.setUpdatedAt(Instant.now());
        staffRepository.save(staff);

        auditLogger.log(AuditLog.builder()
                .actorId("staff-001").actorName("System")
                .businessId(staff.getBusinessId())
                .action(AuditAction.RESET_PIN)
                .entityType("Staff").entityId(staffId)
                .description("Reset PIN for staff member: " + staff.getName())
                .timestamp(LocalDateTime.now())
                .build());

        return newPin;
    }

    private Map<String, Object> staffToMap(Staff staff) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("name", staff.getName());
        map.put("email", staff.getEmail());
        map.put("phone", staff.getPhone());
        map.put("role", staff.getRole() != null ? staff.getRole().name() : null);
        map.put("active", staff.isActive());
        return map;
    }
}
