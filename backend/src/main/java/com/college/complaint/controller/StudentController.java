package com.college.complaint.controller;

import com.college.complaint.dto.response.DashboardStatsResponse;
import com.college.complaint.entity.User;
import com.college.complaint.service.AnalyticsService;
import com.college.complaint.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final AnalyticsService analyticsService;
    private final AuthService authService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> dashboard() {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(analyticsService.getStudentStats(user));
    }
}
