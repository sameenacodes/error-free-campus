package com.college.complaint.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AiAnalysisResponse {
    private Long id;
    private String suggestedCategory;
    private Double categoryConfidence;
    private String suggestedPriority;
    private Double priorityConfidence;
    private String suggestedDepartment;
    private String suggestedServiceUnit;
    private String summary;
    private String suggestedResolution;
    private String sentiment;
    private String urgencyLevel;
    private Long duplicateComplaintId;
    private String duplicateComplaintTitle;
    private Double duplicateSimilarity;
    private boolean duplicateFound;
    private boolean aiAvailable;
    private String source; // "AI_MODEL" or "RULE_BASED"
    private String message;
}
