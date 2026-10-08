package com.college.complaint.repository;

import com.college.complaint.entity.Notification;
import com.college.complaint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(User user);
    long countByUserAndReadFalse(User user);
    List<Notification> findTop5ByUserOrderByCreatedAtDesc(User user);
}
