package com.college.complaint.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ComplaintDetailResponse {
    private ComplaintResponse complaint;
    private List<StatusHistoryItem> timeline;
    private AiAnalysisResponse aiAnalysis;
    private String resolutionNotes;
    private String actionTaken;
    private String materialsUsed;

    @Data
    @Builder
    public static class StatusHistoryItem {
        private String fromStatus;
        private String toStatus;
        private String changedByName;
        private String remark;
        private LocalDateTime changedAt;
    }
}
