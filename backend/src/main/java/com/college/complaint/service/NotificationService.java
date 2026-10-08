package com.college.complaint.service;

import com.college.complaint.entity.*;
import com.college.complaint.repository.NotificationRepository;
import com.college.complaint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void send(User user, String title, String message, String type, Long complaintId) {
        Notification notification = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .type(type)
            .complaintId(complaintId)
            .read(false)
            .build();
        notificationRepository.save(notification);
    }

    @Transactional
    public void sendToRole(RoleName role, String title, String message, String type, Long complaintId) {
        userRepository.findByRole(role).forEach(u ->
            send(u, title, message, type, complaintId));
    }

    @Transactional
    public void markAsRead(Long notificationId, User user) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(user.getId())) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllRead(User user) {
        notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user)
            .forEach(n -> { n.setRead(true); notificationRepository.save(n); });
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }

    public java.util.List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }
}
