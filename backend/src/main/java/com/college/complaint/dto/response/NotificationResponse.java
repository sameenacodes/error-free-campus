package com.college.complaint.dto.response;

import com.college.complaint.entity.Notification;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private Long complaintId;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification n) {
        return NotificationResponse.builder()
            .id(n.getId())
            .title(n.getTitle())
            .message(n.getMessage())
            .type(n.getType())
            .read(n.isRead())
            .complaintId(n.getComplaintId())
            .createdAt(n.getCreatedAt())
            .build();
    }
}
