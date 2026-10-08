package com.college.complaint.service;

import com.college.complaint.entity.AuditLog;
import com.college.complaint.entity.User;
import com.college.complaint.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(String action, String description, User performedBy, String entityType, String entityId) {
        AuditLog log = AuditLog.builder()
            .action(action)
            .description(description)
            .performedBy(performedBy)
            .entityType(entityType)
            .entityId(entityId)
            .build();
        auditLogRepository.save(log);
    }

    public Page<AuditLog> getAll(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
