package com.college.complaint.controller;

import com.college.complaint.dto.request.AiAnalyzeRequest;
import com.college.complaint.dto.response.AiAnalysisResponse;
import com.college.complaint.ai.AiService;
import com.college.complaint.service.AnalyticsService;
import com.college.complaint.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final ComplaintService complaintService;
    private final AiService aiService;
    private final AnalyticsService analyticsService;

    @PostMapping("/analyze")
    public ResponseEntity<AiAnalysisResponse> analyze(@RequestBody AiAnalyzeRequest req) {
        AiAnalysisResponse response = complaintService.analyzeWithAi(
            req.getTitle(), req.getDescription(), req.getComplaintId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin-summary")
    public ResponseEntity<AiAnalysisResponse> adminSummary() {
        var stats = analyticsService.getGlobalStats();
        String statsJson = "Total: " + stats.getTotal() +
            ", Pending: " + stats.getPending() +
            ", InProgress: " + stats.getInProgress() +
            ", Resolved: " + stats.getResolved() +
            ", Critical: " + stats.getCritical() +
            ", ByDepartment: " + stats.getByDepartment();
        return ResponseEntity.ok(aiService.generateAdminSummary(statsJson));
    }
}
