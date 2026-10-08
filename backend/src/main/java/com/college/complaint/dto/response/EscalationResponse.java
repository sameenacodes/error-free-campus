package com.college.complaint.dto.response;

import com.college.complaint.entity.Escalation;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class EscalationResponse {
    private Long id;
    private Long complaintId;
    private String complaintTitle;
    private String priority;
    private String status;
    private String departmentName;
    private String studentName;
    private String escalatedByName;
    private String reason;
    private int escalationLevel;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;

    public static EscalationResponse from(Escalation e) {
        return EscalationResponse.builder()
            .id(e.getId())
            .complaintId(e.getComplaint().getId())
            .complaintTitle(e.getComplaint().getTitle())
            .priority(e.getComplaint().getPriority().name())
            .status(e.getComplaint().getStatus().name())
            .departmentName(e.getComplaint().getDepartment() != null ? e.getComplaint().getDepartment().getName() : "General")
            .studentName(e.getComplaint().getStudent() != null ? e.getComplaint().getStudent().getFullName() : "Anonymous")
            .escalatedByName(e.getEscalatedBy() != null ? e.getEscalatedBy().getFullName() : "Automated SLA Monitor")
            .reason(e.getReason())
            .escalationLevel(e.getEscalationLevel())
            .resolvedAt(e.getResolvedAt())
            .createdAt(e.getCreatedAt())
            .build();
    }
}
