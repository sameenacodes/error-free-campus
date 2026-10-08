package com.college.complaint.controller;

import com.college.complaint.dto.response.NotificationResponse;
import com.college.complaint.entity.User;
import com.college.complaint.service.AuthService;
import com.college.complaint.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAll() {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(notificationService.getUserNotifications(user)
            .stream().map(NotificationResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount() {
        User user = authService.getCurrentUserEntity();
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        User user = authService.getCurrentUserEntity();
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        User user = authService.getCurrentUserEntity();
        notificationService.markAllRead(user);
        return ResponseEntity.ok().build();
    }
}
