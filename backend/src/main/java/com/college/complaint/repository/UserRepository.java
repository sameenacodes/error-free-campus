package com.college.complaint.repository;

import com.college.complaint.entity.User;
import com.college.complaint.entity.RoleName;
import com.college.complaint.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(RoleName role);
    List<User> findByRoleAndActiveTrue(RoleName role);
    List<User> findByRoleAndServiceUnit(RoleName role, com.college.complaint.entity.ServiceUnit serviceUnit);
    List<User> findByRoleAndServiceUnitAndActiveTrue(RoleName role, com.college.complaint.entity.ServiceUnit serviceUnit);
    List<User> findByRoleAndDepartment(RoleName role, Department department);
    List<User> findByRoleAndDepartmentId(RoleName role, Long departmentId);
    List<User> findByDepartmentId(Long departmentId);
    long countByRole(RoleName role);
    long countByActive(boolean active);
    long countByDepartmentId(Long departmentId);
}
