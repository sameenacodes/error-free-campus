package com.college.complaint.repository;

import com.college.complaint.entity.Complaint;
import com.college.complaint.entity.ComplaintStatus;
import com.college.complaint.entity.Priority;
import com.college.complaint.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByStudentOrderByCreatedAtDesc(User student);

    Page<Complaint> findByDepartmentIdOrderByCreatedAtDesc(Long departmentId, Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE (c.studentDepartment.id = :deptId OR (c.studentDepartment IS NULL AND c.department.id = :deptId)) ORDER BY c.createdAt DESC")
    Page<Complaint> findByStudentDepartmentOrDepartment(@Param("deptId") Long deptId, Pageable pageable);

    Page<Complaint> findByAssignedStaffOrderByCreatedAtDesc(User staff, Pageable pageable);

    List<Complaint> findByAssignedStaff(User staff);

    Page<Complaint> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Complaint> findByStatus(ComplaintStatus status);

    List<Complaint> findByStatusNotIn(List<ComplaintStatus> statuses);

    List<Complaint> findByPriority(Priority priority);

    List<Complaint> findByPriorityAndStatusNotIn(Priority priority, List<ComplaintStatus> statuses);

    List<Complaint> findTop10ByOrderByCreatedAtDesc();

    long countByStatus(ComplaintStatus status);

    long countByPriority(Priority priority);

    long countByStudentAndStatus(User student, ComplaintStatus status);

    long countByStudent(User student);

    long countByDepartmentId(Long departmentId);

    long countByDepartmentIdAndStatus(Long departmentId, ComplaintStatus status);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE (c.studentDepartment.id = :deptId OR (c.studentDepartment IS NULL AND c.department.id = :deptId))")
    long countByStudentDepartment(@Param("deptId") Long deptId);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE (c.studentDepartment.id = :deptId OR (c.studentDepartment IS NULL AND c.department.id = :deptId)) AND c.status = :status")
    long countByStudentDepartmentAndStatus(@Param("deptId") Long deptId, @Param("status") ComplaintStatus status);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE (c.studentDepartment.id = :deptId OR (c.studentDepartment IS NULL AND c.department.id = :deptId)) AND c.priority = :priority")
    long countByStudentDepartmentAndPriority(@Param("deptId") Long deptId, @Param("priority") Priority priority);

    long countByAssignedStaffAndStatus(User staff, ComplaintStatus status);

    long countByAssignedStaff(User staff);

    @Query("SELECT c FROM Complaint c WHERE c.overdue = true AND c.status NOT IN ('RESOLVED','CLOSED')")
    List<Complaint> findOverdueComplaints();

    @Query("SELECT c FROM Complaint c WHERE c.dueDate < :now AND c.status NOT IN ('RESOLVED','CLOSED') AND c.overdue = false")
    List<Complaint> findNewlyOverdueComplaints(@Param("now") LocalDateTime now);

    @Query("SELECT COALESCE(c.studentDepartment.name, c.department.name, 'General'), COUNT(c) FROM Complaint c GROUP BY COALESCE(c.studentDepartment.name, c.department.name, 'General')")
    List<Object[]> countByDepartment();

    @Query("SELECT c.category.name, COUNT(c) FROM Complaint c WHERE c.category IS NOT NULL GROUP BY c.category.name")
    List<Object[]> countByCategory();

    @Query("SELECT c.serviceUnit, COUNT(c) FROM Complaint c WHERE c.serviceUnit IS NOT NULL GROUP BY c.serviceUnit")
    List<Object[]> countByServiceUnit();

    @Query("SELECT FUNCTION('DATE_TRUNC','month',c.createdAt), COUNT(c) FROM Complaint c GROUP BY FUNCTION('DATE_TRUNC','month',c.createdAt) ORDER BY 1")
    List<Object[]> countByMonth();

    @Query("SELECT c FROM Complaint c WHERE c.createdAt BETWEEN :start AND :end")
    List<Complaint> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT c FROM Complaint c WHERE " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:priority IS NULL OR c.priority = :priority) AND " +
           "(:departmentId IS NULL OR c.studentDepartment.id = :departmentId OR (c.studentDepartment IS NULL AND c.department.id = :departmentId))")
    Page<Complaint> findWithFilters(
        @Param("status") ComplaintStatus status,
        @Param("priority") Priority priority,
        @Param("departmentId") Long departmentId,
        Pageable pageable
    );

    @Query("SELECT c FROM Complaint c WHERE c.student = :student AND " +
           "(:status IS NULL OR c.status = :status)")
    List<Complaint> findByStudentAndOptionalStatus(@Param("student") User student, @Param("status") ComplaintStatus status);
}
