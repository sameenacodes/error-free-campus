package com.college.complaint.service;

import com.college.complaint.dto.response.UserResponse;
import com.college.complaint.entity.*;
import com.college.complaint.exception.*;
import com.college.complaint.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserResponse::from);
    }

    public UserResponse getUserById(Long id) {
        return userRepository.findById(id)
            .map(UserResponse::from)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Transactional
    public UserResponse createUser(Map<String, Object> req, User admin) {
        String email = (String) req.get("email");
        if (userRepository.existsByEmail(email)) throw new BadRequestException("Email already registered");

        RoleName role;
        try { role = RoleName.valueOf((String) req.get("role")); }
        catch (Exception e) { throw new BadRequestException("Invalid role"); }

        Department department = null;
        if (req.get("departmentId") != null && !req.get("departmentId").toString().isBlank()) {
            Long deptId = Long.parseLong(req.get("departmentId").toString());
            department = departmentRepository.findById(deptId)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", deptId));
        }

        ServiceUnit serviceUnit = null;
        if (req.get("serviceUnit") != null && !req.get("serviceUnit").toString().isBlank()) {
            serviceUnit = ServiceUnit.fromString(req.get("serviceUnit").toString());
        }

        User user = User.builder()
            .firstName((String) req.get("firstName"))
            .lastName((String) req.get("lastName"))
            .email(email)
            .password(passwordEncoder.encode((String) req.getOrDefault("password", "Password@123")))
            .phone((String) req.get("phone"))
            .employeeId((String) req.get("employeeId"))
            .role(role)
            .department(department)
            .serviceUnit(serviceUnit)
            .active(true)
            .build();

        user = userRepository.save(user);
        auditLogService.log("USER_CREATED", "Admin created user: " + email + " with role " + role +
            (serviceUnit != null ? " [ServiceUnit: " + serviceUnit.name() + "]" : ""),
            admin, "User", user.getId().toString());
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse updateUser(Long id, Map<String, Object> req, User admin) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (req.containsKey("firstName")) user.setFirstName((String) req.get("firstName"));
        if (req.containsKey("lastName")) user.setLastName((String) req.get("lastName"));
        if (req.containsKey("phone")) user.setPhone((String) req.get("phone"));
        if (req.containsKey("employeeId")) user.setEmployeeId((String) req.get("employeeId"));
        if (req.containsKey("active")) user.setActive((Boolean) req.get("active"));
        if (req.containsKey("role")) {
            try { user.setRole(RoleName.valueOf((String) req.get("role"))); }
            catch (Exception e) { throw new BadRequestException("Invalid role"); }
        }
        if (req.containsKey("serviceUnit")) {
            String su = (String) req.get("serviceUnit");
            user.setServiceUnit(su != null && !su.isBlank() ? ServiceUnit.fromString(su) : null);
        }
        if (req.containsKey("departmentId")) {
            if (req.get("departmentId") != null && !req.get("departmentId").toString().isBlank()) {
                Long deptId = Long.parseLong(req.get("departmentId").toString());
                user.setDepartment(departmentRepository.findById(deptId)
                    .orElseThrow(() -> new ResourceNotFoundException("Department", "id", deptId)));
            } else {
                user.setDepartment(null);
            }
        }
        if (req.containsKey("password") && req.get("password") != null && !((String) req.get("password")).isBlank()) {
            user.setPassword(passwordEncoder.encode((String) req.get("password")));
        }

        user = userRepository.save(user);
        auditLogService.log("USER_UPDATED", "Admin updated user: " + user.getEmail(),
            admin, "User", id.toString());
        return UserResponse.from(user);
    }

    @Transactional
    public void toggleUserActive(Long id, User admin) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setActive(!user.isActive());
        userRepository.save(user);
        auditLogService.log("USER_STATUS_CHANGED", "Admin " + (user.isActive() ? "activated" : "deactivated") +
            " user: " + user.getEmail(), admin, "User", id.toString());
    }

    @Transactional
    public UserResponse updateProfile(Long id, Map<String, Object> req) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        if (req.containsKey("firstName")) user.setFirstName((String) req.get("firstName"));
        if (req.containsKey("lastName")) user.setLastName((String) req.get("lastName"));
        if (req.containsKey("phone")) user.setPhone((String) req.get("phone"));
        return UserResponse.from(userRepository.save(user));
    }
}
