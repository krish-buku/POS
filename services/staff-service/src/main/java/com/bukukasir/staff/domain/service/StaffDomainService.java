package com.bukukasir.staff.domain.service;

import com.bukukasir.common.exception.ResourceNotFoundException;
import com.bukukasir.common.util.IdGenerator;
import com.bukukasir.staff.domain.model.Staff;
import com.bukukasir.staff.domain.port.in.StaffUseCase;
import com.bukukasir.staff.domain.port.out.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class StaffDomainService implements StaffUseCase {

    private final StaffRepository staffRepository;

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
        return staffRepository.save(staff);
    }

    @Override
    public Staff updateStaff(String id, Staff staff) {
        Staff existing = getStaffById(id);
        existing.setName(staff.getName());
        existing.setEmail(staff.getEmail());
        existing.setPhone(staff.getPhone());
        existing.setRole(staff.getRole());
        existing.setPermissions(staff.getPermissions());
        existing.setActive(staff.isActive());
        existing.setUpdatedAt(Instant.now());
        return staffRepository.save(existing);
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
        return newPin;
    }
}
