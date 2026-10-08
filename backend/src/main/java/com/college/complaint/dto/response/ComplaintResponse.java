package com.college.complaint.dto.response;

import com.college.complaint.entity.Complaint;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ComplaintResponse {
    private Long id;
    private String title;
    private String description;
    private String categoryName;
    private Long categoryId;
    private String departmentName;
    private Long departmentId;
    private String studentDepartmentName;
    private Long studentDepartmentId;
    private String serviceUnit;
    private String serviceUnitDisplayName;
    private String aiSuggestedServiceUnit;
    private String priority;
    private String status;
    private String studentName;
    private Long studentId;
    private String assignedHodName;
    private String assignedStaffName;
    private String location;
    private String additionalNotes;
    private boolean aiAnalyzed;
    private boolean overdue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime dueDate;

    public static ComplaintResponse from(Complaint c) {
        String studentDeptName = null;
        Long studentDeptId = null;
        if (c.getStudentDepartment() != null) {
            studentDeptName = c.getStudentDepartment().getName();
            studentDeptId = c.getStudentDepartment().getId();
        } else if (c.getStudent() != null && c.getStudent().getDepartment() != null) {
            studentDeptName = c.getStudent().getDepartment().getName();
            studentDeptId = c.getStudent().getDepartment().getId();
        }

        return ComplaintResponse.builder()
            .id(c.getId())
            .title(c.getTitle())
            .description(c.getDescription())
            .categoryName(c.getCategory() != null ? c.getCategory().getName() : null)
            .categoryId(c.getCategory() != null ? c.getCategory().getId() : null)
            .departmentName(c.getDepartment() != null ? c.getDepartment().getName() : null)
            .departmentId(c.getDepartment() != null ? c.getDepartment().getId() : null)
            .studentDepartmentName(studentDeptName)
            .studentDepartmentId(studentDeptId)
            .serviceUnit(c.getServiceUnit() != null ? c.getServiceUnit().name() : null)
            .serviceUnitDisplayName(c.getServiceUnit() != null ? c.getServiceUnit().getDisplayName() : null)
            .aiSuggestedServiceUnit(c.getAiSuggestedServiceUnit() != null ? c.getAiSuggestedServiceUnit().name() : null)
            .priority(c.getPriority().name())
            .status(c.getStatus().name())
            .studentName(c.getStudent() != null ? c.getStudent().getFullName() : null)
            .studentId(c.getStudent() != null ? c.getStudent().getId() : null)
            .assignedHodName(c.getAssignedHod() != null ? c.getAssignedHod().getFullName() : null)
            .assignedStaffName(c.getAssignedStaff() != null ? c.getAssignedStaff().getFullName() : null)
            .location(c.getLocation())
            .additionalNotes(c.getAdditionalNotes())
            .aiAnalyzed(c.isAiAnalyzed())
            .overdue(c.isOverdue())
            .createdAt(c.getCreatedAt())
            .updatedAt(c.getUpdatedAt())
            .resolvedAt(c.getResolvedAt())
            .dueDate(c.getDueDate())
            .build();
    }
}
