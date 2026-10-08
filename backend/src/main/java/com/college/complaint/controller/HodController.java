package com.college.complaint.controller;

import com.college.complaint.dto.response.*;
import com.college.complaint.entity.*;
import com.college.complaint.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hod")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HOD','PRINCIPAL','ADMIN')")
public class HodController {

    private final ComplaintService complaintService;
    private final AnalyticsService analyticsService;
    private final AuthService authService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> dashboard() {
        User user = authService.getCurrentUserEntity();
        Long deptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
        return ResponseEntity.ok(analyticsService.getDepartmentStats(deptId != null ? deptId : 0L));
    }

    @GetMapping("/analytics")
    public ResponseEntity<DashboardStatsResponse> analytics() {
        User user = authService.getCurrentUserEntity();
        Long deptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
        return ResponseEntity.ok(analyticsService.getDepartmentStats(deptId != null ? deptId : 0L));
    }

    @GetMapping("/complaints")
    public ResponseEntity<Page<ComplaintResponse>> getComplaints(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(complaintService.getHodComplaints(
            user, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/staff")
    public ResponseEntity<java.util.List<UserResponse>> getStaff(
            @RequestParam(required = false) String serviceUnit) {
        return ResponseEntity.ok(complaintService.getStaffForServiceUnit(serviceUnit));
    }
}
