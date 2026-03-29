package com.bukukasir.staff.domain.port.out;

import com.bukukasir.staff.domain.model.Staff;

import java.util.List;
import java.util.Optional;

public interface StaffRepository {

    List<Staff> findByBusinessId(String businessId);

    List<Staff> findAll();

    Optional<Staff> findById(String id);

    Staff save(Staff staff);

    void deleteById(String id);
}
