package com.college.complaint.service;

import com.college.complaint.dto.response.DashboardStatsResponse;
import com.college.complaint.entity.*;
import com.college.complaint.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final EscalationRepository escalationRepository;
    private final ComplaintStatusHistoryRepository historyRepository;

    public DashboardStatsResponse getGlobalStats() {
        List<Complaint> allComplaints = complaintRepository.findAll();
        long total = allComplaints.size();

        long pending = allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.PENDING).count();
        long inProgress = allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.IN_PROGRESS).count();
        long resolved = allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.RESOLVED).count();
        long assigned = allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.ASSIGNED).count();
        long reopened = allComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.REOPENED).count();
        long critical = allComplaints.stream().filter(c -> c.getPriority() == Priority.CRITICAL).count();
        long overdue = allComplaints.stream().filter(Complaint::isOverdue).count();
        long escalated = escalationRepository.countByResolvedAtIsNull();

        double resolutionRate = total > 0 ? Math.round(((double) resolved / total) * 1000.0) / 10.0 : 0.0;

        // Average resolution time
        List<Complaint> resolvedComplaints = allComplaints.stream()
            .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED && c.getResolvedAt() != null && c.getCreatedAt() != null)
            .toList();

        double avgResolutionHours = 0.0;
        if (!resolvedComplaints.isEmpty()) {
            double totalHours = resolvedComplaints.stream()
                .mapToDouble(c -> Math.max(0.5, Duration.between(c.getCreatedAt(), c.getResolvedAt()).toMinutes() / 60.0))
                .sum();
            avgResolutionHours = Math.round((totalHours / resolvedComplaints.size()) * 10.0) / 10.0;
        }

        // Resolved this month
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long resolvedThisMonth = resolvedComplaints.stream()
            .filter(c -> c.getResolvedAt().isAfter(startOfMonth))
            .count();

        // SLA Compliance
        long resolvedWithinSla = resolvedComplaints.stream()
            .filter(c -> c.getDueDate() == null || !c.getResolvedAt().isAfter(c.getDueDate()))
            .count();
        double slaCompliance = resolvedComplaints.isEmpty() ? 100.0 :
            Math.round(((double) resolvedWithinSla / resolvedComplaints.size()) * 1000.0) / 10.0;

        return DashboardStatsResponse.builder()
            .total(total)
            .pending(pending)
            .inProgress(inProgress)
            .resolved(resolved)
            .assigned(assigned)
            .critical(critical)
            .overdue(overdue)
            .reopened(reopened)
            .escalated(escalated)
            .resolutionRate(resolutionRate)
            .averageResolutionHours(avgResolutionHours)
            .resolvedThisMonth(resolvedThisMonth)
            .slaComplianceRate(slaCompliance)
            .byDepartment(getByDepartment(allComplaints))
            .byCategory(getByCategory(allComplaints))
            .byStatus(getByStatus(allComplaints, escalated))
            .byPriority(getByPriority(allComplaints))
            .monthlyTrend(getMonthlyTrend(allComplaints))
            .staffWorkload(getStaffWorkload())
            .userStatsByRole(getUserStatsByRole())
            .topUnresolvedDepartments(getTopUnresolvedDepartments(allComplaints))
            .departmentPerformance(getDepartmentPerformance(allComplaints))
            .criticalComplaintsSummary(getCriticalComplaintsSummary(allComplaints))
            .recentActivity(getRecentActivity())
            .build();
    }

    public DashboardStatsResponse getStudentStats(User student) {
        long total = complaintRepository.countByStudent(student);
        long pending = complaintRepository.countByStudentAndStatus(student, ComplaintStatus.PENDING);
        long inProgress = complaintRepository.countByStudentAndStatus(student, ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByStudentAndStatus(student, ComplaintStatus.RESOLVED);
        long assigned = complaintRepository.countByStudentAndStatus(student, ComplaintStatus.ASSIGNED);
        double resolutionRate = total > 0 ? Math.round(((double) resolved / total) * 1000.0) / 10.0 : 0.0;

        return DashboardStatsResponse.builder()
            .total(total)
            .pending(pending)
            .inProgress(inProgress)
            .resolved(resolved)
            .assigned(assigned)
            .resolutionRate(resolutionRate)
            .build();
    }

    public DashboardStatsResponse getDepartmentStats(Long departmentId) {
        if (departmentId == null) return DashboardStatsResponse.builder().build();

        List<Complaint> deptComplaints = complaintRepository.findByStudentDepartmentOrDepartment(
            departmentId, org.springframework.data.domain.Pageable.unpaged()).getContent();

        long total = deptComplaints.size();
        long pending = deptComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.PENDING).count();
        long inProgress = deptComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.IN_PROGRESS).count();
        long resolved = deptComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.RESOLVED).count();
        long assigned = deptComplaints.stream().filter(c -> c.getStatus() == ComplaintStatus.ASSIGNED).count();
        long critical = deptComplaints.stream().filter(c -> c.getPriority() == Priority.CRITICAL).count();
        long overdue = deptComplaints.stream().filter(Complaint::isOverdue).count();
        double resolutionRate = total > 0 ? Math.round(((double) resolved / total) * 1000.0) / 10.0 : 0.0;

        return DashboardStatsResponse.builder()
            .total(total)
            .pending(pending)
            .inProgress(inProgress)
            .resolved(resolved)
            .assigned(assigned)
            .critical(critical)
            .overdue(overdue)
            .resolutionRate(resolutionRate)
            .byCategory(getByCategory(deptComplaints))
            .byStatus(getByStatus(deptComplaints, 0))
            .byPriority(getByPriority(deptComplaints))
            .monthlyTrend(getMonthlyTrend(deptComplaints))
            .staffWorkload(getDepartmentStaffWorkload(departmentId))
            .criticalComplaintsSummary(getCriticalComplaintsSummary(deptComplaints))
            .build();
    }

    public DashboardStatsResponse getStaffStats(User staff) {
        long total = complaintRepository.countByAssignedStaff(staff);
        long inProgress = complaintRepository.countByAssignedStaffAndStatus(staff, ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByAssignedStaffAndStatus(staff, ComplaintStatus.RESOLVED);
        long assigned = complaintRepository.countByAssignedStaffAndStatus(staff, ComplaintStatus.ASSIGNED);
        double resolutionRate = total > 0 ? Math.round(((double) resolved / total) * 1000.0) / 10.0 : 0.0;

        return DashboardStatsResponse.builder()
            .total(total)
            .inProgress(inProgress)
            .resolved(resolved)
            .assigned(assigned)
            .resolutionRate(resolutionRate)
            .build();
    }

    private Map<String, Long> getByDepartment(List<Complaint> complaints) {
        Map<String, Long> map = new LinkedHashMap<>();
        departmentRepository.findAll().forEach(d -> map.put(d.getName(), 0L));
        for (Complaint c : complaints) {
            String deptName = c.getStudentDepartment() != null ? c.getStudentDepartment().getName()
                : (c.getDepartment() != null ? c.getDepartment().getName() : "General");
            map.merge(deptName, 1L, Long::sum);
        }
        return map;
    }

    private Map<String, Long> getByCategory(List<Complaint> complaints) {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Complaint c : complaints) {
            if (c.getCategory() != null) {
                map.merge(c.getCategory().getName(), 1L, Long::sum);
            } else {
                map.merge("Other", 1L, Long::sum);
            }
        }
        return map;
    }

    private Map<String, Long> getByStatus(List<Complaint> complaints, long escalatedCount) {
        Map<String, Long> map = new LinkedHashMap<>();
        for (ComplaintStatus s : ComplaintStatus.values()) {
            long count = complaints.stream().filter(c -> c.getStatus() == s).count();
            map.put(s.name(), count);
        }
        if (escalatedCount > 0) {
            map.put("ESCALATED", escalatedCount);
        }
        return map;
    }

    private Map<String, Long> getByPriority(List<Complaint> complaints) {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Priority p : Priority.values()) {
            long count = complaints.stream().filter(c -> c.getPriority() == p).count();
            map.put(p.name(), count);
        }
        return map;
    }

    private List<Map<String, Object>> getMonthlyTrend(List<Complaint> complaints) {
        List<Map<String, Object>> result = new ArrayList<>();
        int currentYear = LocalDateTime.now().getYear();

        // 12 months (January to December)
        for (int month = 1; month <= 12; month++) {
            Month m = Month.of(month);
            String monthName = m.getDisplayName(TextStyle.FULL, Locale.ENGLISH);

            final int targetMonth = month;
            long count = complaints.stream()
                .filter(c -> c.getCreatedAt() != null &&
                             c.getCreatedAt().getYear() == currentYear &&
                             c.getCreatedAt().getMonthValue() == targetMonth)
                .count();

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", monthName);
            entry.put("shortMonth", m.getDisplayName(TextStyle.SHORT, Locale.ENGLISH));
            entry.put("count", count);
            result.add(entry);
        }
        return result;
    }

    private List<Map<String, Object>> getStaffWorkload() {
        List<Map<String, Object>> result = new ArrayList<>();
        userRepository.findByRole(RoleName.STAFF).forEach(staff -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("staffId", staff.getId());
            entry.put("staffName", staff.getFullName());
            entry.put("department", staff.getDepartment() != null ? staff.getDepartment().getName() : "General");
            long active = complaintRepository.countByAssignedStaffAndStatus(staff, ComplaintStatus.IN_PROGRESS)
                + complaintRepository.countByAssignedStaffAndStatus(staff, ComplaintStatus.ASSIGNED);
            long resolved = complaintRepository.countByAssignedStaffAndStatus(staff, ComplaintStatus.RESOLVED);
            entry.put("active", active);
            entry.put("resolved", resolved);
            entry.put("total", active + resolved);
            result.add(entry);
        });
        return result;
    }

    private List<Map<String, Object>> getDepartmentStaffWorkload(Long departmentId) {
        List<Map<String, Object>> result = new ArrayList<>();
        userRepository.findByRoleAndDepartmentId(RoleName.STAFF, departmentId).forEach(staff -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("staffId", staff.getId());
            entry.put("staffName", staff.getFullName());
            long active = complaintRepository.countByAssignedStaffAndStatus(staff, ComplaintStatus.IN_PROGRESS)
                + complaintRepository.countByAssignedStaffAndStatus(staff, ComplaintStatus.ASSIGNED);
            long resolved = complaintRepository.countByAssignedStaffAndStatus(staff, ComplaintStatus.RESOLVED);
            entry.put("active", active);
            entry.put("resolved", resolved);
            result.add(entry);
        });
        return result;
    }

    private Map<String, Long> getUserStatsByRole() {
        Map<String, Long> stats = new LinkedHashMap<>();
        for (RoleName role : RoleName.values()) {
            stats.put(role.name(), userRepository.countByRole(role));
        }
        return stats;
    }

    private List<Map<String, Object>> getTopUnresolvedDepartments(List<Complaint> complaints) {
        Map<String, Long> unresolvedByDept = new HashMap<>();
        for (Complaint c : complaints) {
            if (c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.CLOSED) {
                String dName = c.getDepartment() != null ? c.getDepartment().getName() : "General";
                unresolvedByDept.merge(dName, 1L, Long::sum);
            }
        }

        return unresolvedByDept.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(5)
            .map(e -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("department", e.getKey());
                m.put("unresolvedCount", e.getValue());
                return m;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getDepartmentPerformance(List<Complaint> complaints) {
        List<Map<String, Object>> result = new ArrayList<>();
        departmentRepository.findAll().forEach(dept -> {
            List<Complaint> deptList = complaints.stream()
                .filter(c -> c.getDepartment() != null && c.getDepartment().getId().equals(dept.getId()))
                .toList();

            long total = deptList.size();
            long resolved = deptList.stream().filter(c -> c.getStatus() == ComplaintStatus.RESOLVED).count();
            long pending = deptList.stream().filter(c -> c.getStatus() == ComplaintStatus.PENDING || c.getStatus() == ComplaintStatus.ASSIGNED || c.getStatus() == ComplaintStatus.IN_PROGRESS).count();
            double rate = total > 0 ? Math.round(((double) resolved / total) * 1000.0) / 10.0 : 0.0;

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", dept.getId());
            m.put("name", dept.getName());
            m.put("code", dept.getCode());
            m.put("total", total);
            m.put("resolved", resolved);
            m.put("pending", pending);
            m.put("resolutionRate", rate);
            result.add(m);
        });
        return result;
    }

    private List<Map<String, Object>> getCriticalComplaintsSummary(List<Complaint> complaints) {
        return complaints.stream()
            .filter(c -> c.getPriority() == Priority.CRITICAL && c.getStatus() != ComplaintStatus.RESOLVED && c.getStatus() != ComplaintStatus.CLOSED)
            .map(c -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", c.getId());
                m.put("title", c.getTitle());
                m.put("department", c.getDepartment() != null ? c.getDepartment().getName() : "General");
                m.put("status", c.getStatus().name());
                m.put("location", c.getLocation() != null ? c.getLocation() : "Campus");
                m.put("createdAt", c.getCreatedAt());
                return m;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> getRecentActivity() {
        return historyRepository.findTop10ByOrderByChangedAtDesc().stream()
            .map(h -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", h.getId());
                m.put("complaintId", h.getComplaint().getId());
                m.put("complaintTitle", h.getComplaint().getTitle());
                m.put("fromStatus", h.getFromStatus() != null ? h.getFromStatus().name() : "NEW");
                m.put("toStatus", h.getToStatus().name());
                m.put("remark", h.getRemark());
                m.put("changedBy", h.getChangedBy() != null ? h.getChangedBy().getFullName() : "System");
                m.put("changedAt", h.getChangedAt());
                return m;
            })
            .collect(Collectors.toList());
    }
}
