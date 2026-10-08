package com.college.complaint.controller;

import com.college.complaint.dto.request.*;
import com.college.complaint.dto.response.*;
import com.college.complaint.entity.User;
import com.college.complaint.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;
    private final AuthService authService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ComplaintResponse> create(@Valid @RequestBody CreateComplaintRequest req) {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(complaintService.createComplaint(req, user));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints() {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(complaintService.getStudentComplaints(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintDetailResponse> getDetail(@PathVariable Long id) {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(complaintService.getComplaintDetail(id, user));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('HOD','ADMIN')")
    public ResponseEntity<ComplaintResponse> assign(@PathVariable Long id,
                                                    @RequestBody AssignComplaintRequest req) {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(complaintService.assignToStaff(id, req, user));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('STAFF','HOD','PRINCIPAL','ADMIN')")
    public ResponseEntity<ComplaintResponse> updateStatus(@PathVariable Long id,
                                                          @RequestBody UpdateStatusRequest req) {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(complaintService.updateStatus(id, req, user));
    }

    @PostMapping("/{id}/resolution")
    @PreAuthorize("hasAnyRole('STAFF','HOD','ADMIN')")
    public ResponseEntity<ComplaintResponse> resolve(@PathVariable Long id,
                                                     @RequestBody ResolutionRequest req) {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(complaintService.resolveComplaint(id, req, user));
    }

    @PutMapping("/{id}/reopen")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ComplaintResponse> reopen(@PathVariable Long id) {
        User user = authService.getCurrentUserEntity();
        UpdateStatusRequest req = new UpdateStatusRequest();
        req.setStatus("REOPENED");
        req.setRemark("Student reopened complaint");
        return ResponseEntity.ok(complaintService.updateStatus(id, req, user));
    }

    @PostMapping("/{id}/escalate")
    @PreAuthorize("hasAnyRole('STUDENT','STAFF','HOD','PRINCIPAL','ADMIN')")
    public ResponseEntity<ComplaintResponse> escalate(@PathVariable Long id,
                                                      @RequestBody(required = false) Map<String, String> body) {
        User user = authService.getCurrentUserEntity();
        String reason = body != null ? body.get("reason") : "Urgent escalation requested";
        return ResponseEntity.ok(complaintService.escalateComplaint(id, reason, user));
    }
}
