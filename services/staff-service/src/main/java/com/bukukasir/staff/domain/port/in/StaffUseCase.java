package com.bukukasir.staff.domain.port.in;

import com.bukukasir.staff.domain.model.Staff;

import java.util.List;

public interface StaffUseCase {

    List<Staff> getAllStaff(String businessId);

    Staff getStaffById(String id);

    Staff createStaff(Staff staff);

    Staff updateStaff(String id, Staff staff);

    void deleteStaff(String id);

    String resetPin(String staffId);
}
