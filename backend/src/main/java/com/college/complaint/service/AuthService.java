package com.college.complaint.service;

import com.college.complaint.dto.request.LoginRequest;
import com.college.complaint.dto.request.RegisterRequest;
import com.college.complaint.dto.response.AuthResponse;
import com.college.complaint.dto.response.UserResponse;
import com.college.complaint.entity.Department;
import com.college.complaint.entity.RoleName;
import com.college.complaint.entity.User;
import com.college.complaint.exception.BadRequestException;
import com.college.complaint.exception.ResourceNotFoundException;
import com.college.complaint.repository.DepartmentRepository;
import com.college.complaint.repository.UserRepository;
import com.college.complaint.security.JwtTokenProvider;
import com.college.complaint.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
        return AuthResponse.of(token, UserResponse.from(user));
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        
        if (email.isEmpty()) {
            throw new BadRequestException("Email is required.");
        }

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists.");
        }

        if (request.getDepartmentId() == null) {
            throw new BadRequestException("Academic department is required for student registration.");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
            .orElseThrow(() -> new BadRequestException("Selected academic department is invalid or does not exist."));

        String studentId = request.getStudentId() != null && !request.getStudentId().trim().isEmpty()
            ? request.getStudentId().trim()
            : (request.getEmployeeId() != null ? request.getEmployeeId().trim() : null);

        if (studentId == null || studentId.isEmpty()) {
            throw new BadRequestException("Student ID (Roll Number) is required.");
        }

        User user = User.builder()
            .firstName(request.getFirstName().trim())
            .lastName(request.getLastName().trim())
            .email(email)
            .password(passwordEncoder.encode(request.getPassword()))
            .phone(request.getPhone() != null ? request.getPhone().trim() : null)
            .employeeId(studentId)
            .role(RoleName.STUDENT) // ALWAYS enforce STUDENT role for public registration
            .department(department)
            .active(true)
            .build();

        User savedUser = userRepository.save(user);
        log.info("Successfully registered new student account: {} (ID: {}, Dept: {})", 
            savedUser.getEmail(), savedUser.getId(), department.getName());

        return UserResponse.from(savedUser);
    }

    public UserResponse getCurrentUser() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext()
            .getAuthentication().getPrincipal();
        User user = userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
        return UserResponse.from(user);
    }

    public User getCurrentUserEntity() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext()
            .getAuthentication().getPrincipal();
        return userRepository.findById(principal.getId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
    }
}
