package com.college.complaint.service;

import com.college.complaint.dto.response.DepartmentResponse;
import com.college.complaint.dto.response.CategoryResponse;
import com.college.complaint.entity.Category;
import com.college.complaint.entity.Department;
import com.college.complaint.exception.BadRequestException;
import com.college.complaint.exception.ResourceNotFoundException;
import com.college.complaint.repository.CategoryRepository;
import com.college.complaint.repository.DepartmentRepository;
import com.college.complaint.repository.ComplaintRepository;
import com.college.complaint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentCategoryService {

    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    // --- Departments ---
    public List<DepartmentResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
            .map(DepartmentResponse::from).collect(Collectors.toList());
    }

    public List<DepartmentResponse> getActiveDepartments() {
        return departmentRepository.findByActive(true).stream()
            .map(DepartmentResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public DepartmentResponse createDepartment(Map<String, String> req) {
        String name = req.get("name");
        String code = req.get("code");
        if (departmentRepository.existsByCode(code)) throw new BadRequestException("Department code already exists");
        Department dept = Department.builder().name(name).code(code)
            .description(req.get("description")).active(true).build();
        return DepartmentResponse.from(departmentRepository.save(dept));
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, Map<String, Object> req) {
        Department dept = departmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        if (req.containsKey("name")) dept.setName((String) req.get("name"));
        if (req.containsKey("description")) dept.setDescription((String) req.get("description"));
        if (req.containsKey("active")) dept.setActive((Boolean) req.get("active"));
        return DepartmentResponse.from(departmentRepository.save(dept));
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        
        long userCount = userRepository.countByDepartmentId(id);
        long complaintCount = complaintRepository.countByDepartmentId(id);
        
        if (userCount > 0 || complaintCount > 0) {
            // Safely deactivate to prevent DB constraint violation
            dept.setActive(false);
            departmentRepository.save(dept);
        } else {
            departmentRepository.delete(dept);
        }
    }

    // --- Categories ---
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
            .map(CategoryResponse::from).collect(Collectors.toList());
    }

    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByActive(true).stream()
            .map(CategoryResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(Map<String, String> req) {
        String name = req.get("name");
        if (categoryRepository.existsByName(name)) throw new BadRequestException("Category already exists");
        Category cat = Category.builder().name(name).description(req.get("description")).active(true).build();
        return CategoryResponse.from(categoryRepository.save(cat));
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, Map<String, Object> req) {
        Category cat = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        if (req.containsKey("name")) cat.setName((String) req.get("name"));
        if (req.containsKey("description")) cat.setDescription((String) req.get("description"));
        if (req.containsKey("active")) cat.setActive((Boolean) req.get("active"));
        return CategoryResponse.from(categoryRepository.save(cat));
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category cat = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        
        // Deactivate safely
        cat.setActive(false);
        categoryRepository.save(cat);
    }
}
