package com.college.complaint.controller;

import com.college.complaint.dto.response.*;
import com.college.complaint.entity.*;
import com.college.complaint.repository.EscalationRepository;
import com.college.complaint.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/principal")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('PRINCIPAL','ADMIN')")
public class PrincipalController {

    private final ComplaintService complaintService;
    private final AnalyticsService analyticsService;
    private final EscalationRepository escalationRepository;
    private final AuthService authService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> dashboard() {
        return ResponseEntity.ok(analyticsService.getGlobalStats());
    }

    @GetMapping("/analytics")
    public ResponseEntity<DashboardStatsResponse> analytics() {
        return ResponseEntity.ok(analyticsService.getGlobalStats());
    }

    @GetMapping("/complaints")
    public ResponseEntity<Page<ComplaintResponse>> allComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ComplaintStatus cs = null;
        Priority pr = null;
        try { if (status != null) cs = ComplaintStatus.valueOf(status); } catch (Exception ignored) {}
        try { if (priority != null) pr = Priority.valueOf(priority); } catch (Exception ignored) {}
        return ResponseEntity.ok(complaintService.getAllComplaints(cs, pr, departmentId, page, size));
    }

    @GetMapping("/escalations")
    public ResponseEntity<List<EscalationResponse>> escalations() {
        List<EscalationResponse> list = escalationRepository.findByResolvedAtIsNullOrderByCreatedAtDesc()
            .stream().map(EscalationResponse::from).toList();
        return ResponseEntity.ok(list);
    }

    @PutMapping("/escalations/{id}/resolve")
    public ResponseEntity<Void> resolveEscalation(@PathVariable Long id) {
        User user = authService.getCurrentUserEntity();
        complaintService.resolveEscalation(id, user);
        return ResponseEntity.ok().build();
    }
}
