package com.college.complaint.dto.request;

import lombok.Data;

@Data
public class AiAnalyzeRequest {
    private String title;
    private String description;
    private Long complaintId;
}
