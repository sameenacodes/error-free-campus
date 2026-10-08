package com.college.complaint.controller;

import com.college.complaint.dto.response.*;
import com.college.complaint.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@CrossOrigin
@RequiredArgsConstructor
public class PublicController {

    private final DepartmentCategoryService deptCatService;

    @GetMapping("/departments")
    public ResponseEntity<List<DepartmentResponse>> departments() {
        return ResponseEntity.ok(deptCatService.getActiveDepartments());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> categories() {
        return ResponseEntity.ok(deptCatService.getActiveCategories());
    }

    @GetMapping("/service-units")
    public ResponseEntity<List<java.util.Map<String, String>>> serviceUnits() {
        List<java.util.Map<String, String>> units = java.util.Arrays.stream(com.college.complaint.entity.ServiceUnit.values())
            .map(u -> java.util.Map.of("code", u.name(), "name", u.getDisplayName()))
            .toList();
        return ResponseEntity.ok(units);
    }
}
