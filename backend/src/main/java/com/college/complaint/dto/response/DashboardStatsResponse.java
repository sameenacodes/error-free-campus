package com.college.complaint.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.Map;
import java.util.List;

@Data
@Builder
public class DashboardStatsResponse {
    private long total;
    private long pending;
    private long inProgress;
    private long resolved;
    private long assigned;
    private long critical;
    private long overdue;
    private long reopened;
    private long escalated;
    private double resolutionRate;
    private double averageResolutionHours;
    private long resolvedThisMonth;
    private double slaComplianceRate;

    private Map<String, Long> byDepartment;
    private Map<String, Long> byCategory;
    private Map<String, Long> byStatus;
    private Map<String, Long> byPriority;
    private List<Map<String, Object>> monthlyTrend;
    private List<Map<String, Object>> staffWorkload;

    // Advanced analytics
    private Map<String, Long> userStatsByRole;
    private List<Map<String, Object>> topUnresolvedDepartments;
    private List<Map<String, Object>> departmentPerformance;
    private List<Map<String, Object>> criticalComplaintsSummary;
    private List<Map<String, Object>> recentActivity;
}
