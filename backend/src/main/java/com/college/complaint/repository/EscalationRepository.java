package com.college.complaint.repository;

import com.college.complaint.entity.Escalation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EscalationRepository extends JpaRepository<Escalation, Long> {
    List<Escalation> findByResolvedAtIsNullOrderByCreatedAtDesc();
    List<Escalation> findByComplaintId(Long complaintId);
    long countByResolvedAtIsNull();
    boolean existsByComplaintIdAndResolvedAtIsNull(Long complaintId);
}
