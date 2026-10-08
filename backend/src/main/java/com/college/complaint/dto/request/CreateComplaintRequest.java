package com.college.complaint.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateComplaintRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    private Long categoryId;
    private Long departmentId;
    private String serviceUnit;
    private String priority;
    private String location;
    private String additionalNotes;
}
