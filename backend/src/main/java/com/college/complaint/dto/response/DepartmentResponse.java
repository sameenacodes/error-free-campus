package com.college.complaint.dto.response;

import com.college.complaint.entity.Department;
import com.college.complaint.entity.Category;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class DepartmentResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private boolean active;
    private LocalDateTime createdAt;

    public static DepartmentResponse from(Department d) {
        return DepartmentResponse.builder()
            .id(d.getId()).name(d.getName()).code(d.getCode())
            .description(d.getDescription()).active(d.isActive())
            .createdAt(d.getCreatedAt()).build();
    }
}
