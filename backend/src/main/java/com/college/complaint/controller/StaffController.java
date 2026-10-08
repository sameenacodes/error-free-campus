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
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF','HOD','ADMIN')")
public class StaffController {

    private final ComplaintService complaintService;
    private final AnalyticsService analyticsService;
    private final AuthService authService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> dashboard() {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(analyticsService.getStaffStats(user));
    }

    @GetMapping("/complaints")
    public ResponseEntity<Page<ComplaintResponse>> getAssigned(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(complaintService.getStaffComplaints(
            user, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }
}
