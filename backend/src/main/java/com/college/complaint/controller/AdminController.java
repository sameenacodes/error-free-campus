package com.college.complaint.controller;

import com.college.complaint.dto.response.*;
import com.college.complaint.entity.User;
import com.college.complaint.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final DepartmentCategoryService deptCatService;
    private final ComplaintService complaintService;
    private final AnalyticsService analyticsService;
    private final AuditLogService auditLogService;
    private final AuthService authService;

    // --- Dashboard ---
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsResponse> dashboard() {
        return ResponseEntity.ok(analyticsService.getGlobalStats());
    }

    @GetMapping("/analytics")
    public ResponseEntity<DashboardStatsResponse> analytics() {
        return ResponseEntity.ok(analyticsService.getGlobalStats());
    }

    // --- Users ---
    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(userService.getAllUsers(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponse> createUser(@RequestBody Map<String, Object> req) {
        User admin = authService.getCurrentUserEntity();
        return ResponseEntity.ok(userService.createUser(req, admin));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        User admin = authService.getCurrentUserEntity();
        return ResponseEntity.ok(userService.updateUser(id, req, admin));
    }

    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<Void> toggleUser(@PathVariable Long id) {
        User admin = authService.getCurrentUserEntity();
        userService.toggleUserActive(id, admin);
        return ResponseEntity.ok().build();
    }

    // --- Departments ---
    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentResponse>> getDepartments() {
        return ResponseEntity.ok(deptCatService.getAllDepartments());
    }

    @PostMapping("/departments")
    public ResponseEntity<DepartmentResponse> createDepartment(@RequestBody Map<String, String> req) {
        return ResponseEntity.ok(deptCatService.createDepartment(req));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<DepartmentResponse> updateDepartment(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        return ResponseEntity.ok(deptCatService.updateDepartment(id, req));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        deptCatService.deleteDepartment(id);
        return ResponseEntity.noContent().build();
    }

    // --- Categories ---
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(deptCatService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(@RequestBody Map<String, String> req) {
        return ResponseEntity.ok(deptCatService.createCategory(req));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id, @RequestBody Map<String, Object> req) {
        return ResponseEntity.ok(deptCatService.updateCategory(id, req));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        deptCatService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // --- Complaints ---
    @GetMapping("/complaints")
    public ResponseEntity<Page<ComplaintResponse>> getAllComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        com.college.complaint.entity.ComplaintStatus cs = null;
        com.college.complaint.entity.Priority pr = null;
        try { if (status != null) cs = com.college.complaint.entity.ComplaintStatus.valueOf(status); } catch (Exception ignored) {}
        try { if (priority != null) pr = com.college.complaint.entity.Priority.valueOf(priority); } catch (Exception ignored) {}
        return ResponseEntity.ok(complaintService.getAllComplaints(cs, pr, departmentId, page, size));
    }

    // --- Audit Logs ---
    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(
            auditLogService.getAll(PageRequest.of(page, size))
                .map(AuditLogResponse::from)
        );
    }
}
