package com.college.complaint.controller;

import com.college.complaint.dto.response.UserResponse;
import com.college.complaint.entity.User;
import com.college.complaint.service.AuthService;
import com.college.complaint.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AuthService authService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserResponse> getProfile() {
        return ResponseEntity.ok(authService.getCurrentUser());
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateProfile(@RequestBody Map<String, Object> req) {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(userService.updateProfile(user.getId(), req));
    }
}
