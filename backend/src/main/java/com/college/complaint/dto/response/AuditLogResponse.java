package com.college.complaint.dto.response;

import com.college.complaint.entity.AuditLog;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AuditLogResponse {
    private Long id;
    private String action;
    private String description;
    private String performedByName;
    private String performedByEmail;
    private String entityType;
    private String entityId;
    private LocalDateTime createdAt;

    public static AuditLogResponse from(AuditLog log) {
        return AuditLogResponse.builder()
            .id(log.getId())
            .action(log.getAction())
            .description(log.getDescription())
            .performedByName(log.getPerformedBy() != null ? log.getPerformedBy().getFullName() : "System")
            .performedByEmail(log.getPerformedBy() != null ? log.getPerformedBy().getEmail() : null)
            .entityType(log.getEntityType())
            .entityId(log.getEntityId())
            .createdAt(log.getCreatedAt())
            .build();
    }
}
