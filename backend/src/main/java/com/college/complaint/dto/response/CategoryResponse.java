package com.college.complaint.dto.response;

import com.college.complaint.entity.Category;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private boolean active;
    private LocalDateTime createdAt;

    public static CategoryResponse from(Category c) {
        return CategoryResponse.builder()
            .id(c.getId()).name(c.getName()).description(c.getDescription())
            .active(c.isActive()).createdAt(c.getCreatedAt()).build();
    }
}
