package com.college.complaint.dto.response;

import com.college.complaint.entity.User;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String employeeId;
    private String role;
    private String serviceUnit;
    private String departmentName;
    private Long departmentId;
    private boolean active;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .employeeId(user.getEmployeeId())
            .role(user.getRole().name())
            .serviceUnit(user.getServiceUnit() != null ? user.getServiceUnit().name() : null)
            .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
            .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
            .active(user.isActive())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
