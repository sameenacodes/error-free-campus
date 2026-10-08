package com.college.complaint.service;

import com.college.complaint.ai.AiService;
import com.college.complaint.dto.request.*;
import com.college.complaint.dto.response.*;
import com.college.complaint.entity.*;
import com.college.complaint.exception.*;
import com.college.complaint.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CategoryRepository categoryRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final AiAnalysisRepository aiAnalysisRepository;
    private final UserRepository userRepository;
    private final EscalationRepository escalationRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final AiService aiService;

    @Transactional
    public ComplaintResponse createComplaint(CreateComplaintRequest req, User student) {
        Category category = req.getCategoryId() != null
            ? categoryRepository.findById(req.getCategoryId()).orElse(null) : null;

        // Auto-bind student's academic department
        Department studentDept = student.getDepartment();
        if (studentDept == null && req.getDepartmentId() != null) {
            studentDept = departmentRepository.findById(req.getDepartmentId()).orElse(null);
        }

        Priority priority = Priority.MEDIUM;
        if (req.getPriority() != null) {
            try { priority = Priority.valueOf(req.getPriority()); } catch (Exception ignored) {}
        }

        // Determine AI service unit and initial service unit
        AiAnalysisResponse ai = aiService.analyzeComplaint(req.getTitle(), req.getDescription());
        ServiceUnit aiSuggested = ai != null && ai.getSuggestedServiceUnit() != null
            ? ServiceUnit.fromString(ai.getSuggestedServiceUnit()) : ServiceUnit.OTHER;

        ServiceUnit finalUnit = req.getServiceUnit() != null && !req.getServiceUnit().isBlank()
            ? ServiceUnit.fromString(req.getServiceUnit()) : aiSuggested;

        // Auto-assign HOD of the student's department
        User assignedHod = null;
        if (studentDept != null) {
            List<User> hods = userRepository.findByRoleAndDepartmentId(RoleName.HOD, studentDept.getId());
            if (!hods.isEmpty()) {
                assignedHod = hods.get(0);
            }
        }

        LocalDateTime dueDate = computeDueDate(priority);

        Complaint complaint = Complaint.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .category(category)
            .department(studentDept)
            .studentDepartment(studentDept)
            .serviceUnit(finalUnit)
            .aiSuggestedServiceUnit(aiSuggested)
            .priority(priority)
            .status(ComplaintStatus.PENDING)
            .student(student)
            .assignedHod(assignedHod)
            .location(req.getLocation())
            .additionalNotes(req.getAdditionalNotes())
            .dueDate(dueDate)
            .aiAnalyzed(ai != null && ai.isAiAvailable())
            .build();

        complaint = complaintRepository.save(complaint);

        // Save AI analysis record if available
        if (ai != null && ai.isAiAvailable()) {
            AiAnalysis analysis = AiAnalysis.builder()
                .complaint(complaint)
                .suggestedCategory(ai.getSuggestedCategory())
                .categoryConfidence(ai.getCategoryConfidence())
                .suggestedPriority(ai.getSuggestedPriority())
                .priorityConfidence(ai.getPriorityConfidence())
                .suggestedDepartment(ai.getSuggestedDepartment())
                .suggestedServiceUnit(aiSuggested.name())
                .summary(ai.getSummary())
                .suggestedResolution(ai.getSuggestedResolution())
                .sentiment(ai.getSentiment())
                .urgencyLevel(ai.getUrgencyLevel())
                .aiAvailable(true)
                .build();
            aiAnalysisRepository.save(analysis);
        }

        // Record initial status history
        saveHistory(complaint, null, ComplaintStatus.PENDING, student, "Complaint submitted to " +
            (studentDept != null ? studentDept.getName() : "Department") + " HOD for review");

        // Notify student of successful submission to their HOD
        notificationService.send(student,
            "Complaint Submitted Successfully",
            "Your complaint #" + complaint.getId() + " \"" + complaint.getTitle() +
            "\" has been routed to your Department HOD (" + (studentDept != null ? studentDept.getCode() : "General") + ") for review.",
            "SUCCESS", complaint.getId());

        final Department finalDept = studentDept;
        final Complaint saved = complaint;
        if (finalDept != null) {
            userRepository.findByRoleAndDepartmentId(RoleName.HOD, finalDept.getId())
                .forEach(h -> notificationService.send(h,
                    "New Complaint Received (" + finalDept.getCode() + " Student)",
                    "A new complaint #" + saved.getId() + " \"" + saved.getTitle() + "\" has been submitted by " +
                    student.getFullName() + ". Suggested Service Unit: " + finalUnit.getDisplayName(),
                    "INFO", saved.getId()));
        }

        // Notify Principals for Critical issues
        if (priority == Priority.CRITICAL) {
            notificationService.sendToRole(RoleName.PRINCIPAL,
                "Critical Complaint Submitted",
                "Critical complaint #" + saved.getId() + " \"" + saved.getTitle() + "\" (" +
                (finalDept != null ? finalDept.getCode() : "General") + ") requires immediate attention.",
                "DANGER", saved.getId());
        }

        auditLogService.log("COMPLAINT_CREATED", "Student " + student.getEmail() + " (" +
            (studentDept != null ? studentDept.getCode() : "N/A") + ") submitted complaint #" +
            complaint.getId() + ": " + complaint.getTitle() + " [Service Unit: " + finalUnit.name() + "]",
            student, "Complaint", complaint.getId().toString());

        return ComplaintResponse.from(complaint);
    }

    @Transactional
    public ComplaintResponse assignToStaff(Long complaintId, AssignComplaintRequest req, User hod) {
        Complaint complaint = getComplaintOrThrow(complaintId);

        // Security check for HOD: can only assign complaints from own student department
        if (hod.getRole() == RoleName.HOD) {
            Long deptId = complaint.getStudentDepartment() != null
                ? complaint.getStudentDepartment().getId()
                : (complaint.getDepartment() != null ? complaint.getDepartment().getId() : null);
            if (deptId == null || hod.getDepartment() == null || !deptId.equals(hod.getDepartment().getId())) {
                throw new UnauthorizedException("You can only assign complaints belonging to your academic department");
            }
        }

        User staff = userRepository.findById(req.getStaffId())
            .orElseThrow(() -> new ResourceNotFoundException("Staff", "id", req.getStaffId()));
        if (staff.getRole() != RoleName.STAFF) {
            throw new BadRequestException("User is not a staff member");
        }
        if (!staff.isActive()) {
            throw new BadRequestException("Selected staff member is inactive");
        }

        // Update service unit if specified by HOD or inherited from staff
        if (req.getServiceUnit() != null && !req.getServiceUnit().isBlank()) {
            complaint.setServiceUnit(ServiceUnit.fromString(req.getServiceUnit()));
        } else if (staff.getServiceUnit() != null) {
            complaint.setServiceUnit(staff.getServiceUnit());
        }

        ComplaintStatus prevStatus = complaint.getStatus();
        complaint.setAssignedHod(hod);
        complaint.setAssignedStaff(staff);
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaint = complaintRepository.save(complaint);

        String serviceUnitName = complaint.getServiceUnit() != null ? complaint.getServiceUnit().getDisplayName() : "Service Unit";
        String historyRemark = req.getRemark() != null && !req.getRemark().isBlank()
            ? req.getRemark()
            : "Assigned to " + staff.getFullName() + " (" + serviceUnitName + ")";

        saveHistory(complaint, prevStatus, ComplaintStatus.ASSIGNED, hod, historyRemark);

        notificationService.send(staff, "New Complaint Assigned",
            "Complaint #" + complaintId + " \"" + complaint.getTitle() + "\" has been assigned to you by HOD " + hod.getFullName() + ".",
            "INFO", complaintId);
        notificationService.send(complaint.getStudent(), "Complaint Assigned to " + serviceUnitName,
            "Your complaint #" + complaintId + " has been assigned to " + staff.getFullName() + " (" + serviceUnitName + ") for resolution.",
            "SUCCESS", complaintId);

        auditLogService.log("COMPLAINT_ASSIGNED", hod.getEmail() + " assigned complaint #" +
            complaintId + " to " + staff.getEmail() + " [Service Unit: " + (complaint.getServiceUnit() != null ? complaint.getServiceUnit().name() : "N/A") + "]",
            hod, "Complaint", complaintId.toString());

        return ComplaintResponse.from(complaint);
    }

    @Transactional
    public ComplaintResponse updateStatus(Long complaintId, UpdateStatusRequest req, User user) {
        Complaint complaint = getComplaintOrThrow(complaintId);

        ComplaintStatus newStatus;
        try {
            newStatus = ComplaintStatus.valueOf(req.getStatus());
        } catch (Exception e) {
            throw new BadRequestException("Invalid status: " + req.getStatus());
        }

        ComplaintStatus prevStatus = complaint.getStatus();
        complaint.setStatus(newStatus);
        if (newStatus == ComplaintStatus.IN_PROGRESS) {
            notificationService.send(complaint.getStudent(), "Work in Progress",
                "Work on your complaint #" + complaintId + " \"" + complaint.getTitle() + "\" has started by staff " + user.getFullName() + ".",
                "INFO", complaintId);
        }
        if (newStatus == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
            notificationService.send(complaint.getStudent(), "Complaint Resolved",
                "Your complaint #" + complaintId + " \"" + complaint.getTitle() + "\" has been resolved.",
                "SUCCESS", complaintId);
        }
        if (newStatus == ComplaintStatus.REOPENED) {
            complaint.setResolvedAt(null);
            if (complaint.getAssignedHod() != null) {
                notificationService.send(complaint.getAssignedHod(), "Complaint Reopened",
                    "Complaint #" + complaintId + " was reopened by student " + user.getFullName(),
                    "WARNING", complaintId);
            }
            if (complaint.getAssignedStaff() != null) {
                notificationService.send(complaint.getAssignedStaff(), "Complaint Reopened",
                    "Complaint #" + complaintId + " was reopened by student " + user.getFullName(),
                    "WARNING", complaintId);
            }
        }
        complaintRepository.save(complaint);

        saveHistory(complaint, prevStatus, newStatus, user, req.getRemark());

        auditLogService.log("STATUS_CHANGED", user.getEmail() + " changed complaint #" +
            complaintId + " status from " + prevStatus + " to " + newStatus, user, "Complaint", complaintId.toString());

        return ComplaintResponse.from(complaint);
    }

    @Transactional
    public ComplaintResponse resolveComplaint(Long complaintId, ResolutionRequest req, User staff) {
        Complaint complaint = getComplaintOrThrow(complaintId);
        ComplaintStatus prevStatus = complaint.getStatus();
        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint.setResolvedAt(LocalDateTime.now());
        complaint.setResolutionNotes(req.getResolutionNotes());
        complaint.setActionTaken(req.getActionTaken());
        complaint.setMaterialsUsed(req.getMaterialsUsed());
        complaintRepository.save(complaint);

        saveHistory(complaint, prevStatus, ComplaintStatus.RESOLVED, staff, req.getResolutionNotes());

        notificationService.send(complaint.getStudent(), "Complaint Resolved",
            "Your complaint #" + complaintId + " has been resolved. Notes: " + req.getResolutionNotes(),
            "SUCCESS", complaintId);
        if (complaint.getAssignedHod() != null) {
            notificationService.send(complaint.getAssignedHod(), "Complaint Resolved by Staff",
                "Complaint #" + complaintId + " has been marked as resolved by " + staff.getFullName(),
                "SUCCESS", complaintId);
        }

        auditLogService.log("COMPLAINT_RESOLVED", staff.getEmail() + " resolved complaint #" + complaintId,
            staff, "Complaint", complaintId.toString());

        return ComplaintResponse.from(complaint);
    }

    @Transactional
    public ComplaintResponse escalateComplaint(Long complaintId, String reason, User user) {
        Complaint complaint = getComplaintOrThrow(complaintId);

        if (complaint.getStatus() == ComplaintStatus.RESOLVED || complaint.getStatus() == ComplaintStatus.CLOSED) {
            throw new BadRequestException("Resolved complaints cannot be escalated");
        }

        // Check active escalation
        if (escalationRepository.existsByComplaintIdAndResolvedAtIsNull(complaintId)) {
            throw new BadRequestException("Complaint is already under active escalation");
        }

        Escalation escalation = Escalation.builder()
            .complaint(complaint)
            .escalatedBy(user)
            .reason(reason != null && !reason.isBlank() ? reason : "Escalated due to SLA delay / urgency")
            .escalationLevel(complaint.getPriority() == Priority.CRITICAL ? 2 : 1)
            .build();
        escalationRepository.save(escalation);

        complaint.setOverdue(true);
        complaintRepository.save(complaint);

        saveHistory(complaint, complaint.getStatus(), complaint.getStatus(), user,
            "Escalated to Principal: " + escalation.getReason());

        // Notify Principal and HOD
        notificationService.sendToRole(RoleName.PRINCIPAL,
            "Complaint Escalated to Principal",
            "Complaint #" + complaintId + " (" + complaint.getTitle() + ") has been escalated: " + escalation.getReason(),
            "DANGER", complaintId);

        if (complaint.getAssignedHod() != null) {
            notificationService.send(complaint.getAssignedHod(),
                "Complaint Escalated",
                "Complaint #" + complaintId + " in your department was escalated: " + escalation.getReason(),
                "WARNING", complaintId);
        }

        auditLogService.log("COMPLAINT_ESCALATED", user.getEmail() + " escalated complaint #" +
            complaintId + ": " + escalation.getReason(), user, "Complaint", complaintId.toString());

        return ComplaintResponse.from(complaint);
    }

    @Transactional
    public void resolveEscalation(Long escalationId, User user) {
        Escalation escalation = escalationRepository.findById(escalationId)
            .orElseThrow(() -> new ResourceNotFoundException("Escalation", "id", escalationId));
        escalation.setResolvedAt(LocalDateTime.now());
        escalationRepository.save(escalation);

        auditLogService.log("ESCALATION_RESOLVED", "Escalation #" + escalationId + " marked as resolved by " +
            user.getEmail(), user, "Escalation", escalationId.toString());
    }

    public ComplaintDetailResponse getComplaintDetail(Long complaintId, User requestingUser) {
        Complaint complaint = getComplaintOrThrow(complaintId);

        // Access control
        switch (requestingUser.getRole()) {
            case STUDENT -> {
                if (!complaint.getStudent().getId().equals(requestingUser.getId()))
                    throw new UnauthorizedException("You can only view your own complaints");
            }
            case STAFF -> {
                boolean isAssigned = complaint.getAssignedStaff() != null && complaint.getAssignedStaff().getId().equals(requestingUser.getId());
                boolean isSameServiceUnit = requestingUser.getServiceUnit() != null && complaint.getServiceUnit() != null && requestingUser.getServiceUnit() == complaint.getServiceUnit();
                if (!isAssigned && !isSameServiceUnit)
                    throw new UnauthorizedException("You can only view complaints assigned to you or your service unit");
            }
            case HOD -> {
                Long complaintDeptId = complaint.getStudentDepartment() != null
                    ? complaint.getStudentDepartment().getId()
                    : (complaint.getDepartment() != null ? complaint.getDepartment().getId() : null);
                if (complaintDeptId == null ||
                    requestingUser.getDepartment() == null ||
                    !complaintDeptId.equals(requestingUser.getDepartment().getId()))
                    throw new UnauthorizedException("You can only view complaints from students in your department");
            }
            default -> {} // PRINCIPAL, ADMIN have full access
        }

        List<ComplaintDetailResponse.StatusHistoryItem> timeline = historyRepository
            .findByComplaintIdOrderByChangedAtAsc(complaintId)
            .stream()
            .map(h -> ComplaintDetailResponse.StatusHistoryItem.builder()
                .fromStatus(h.getFromStatus() != null ? h.getFromStatus().name() : null)
                .toStatus(h.getToStatus().name())
                .changedByName(h.getChangedBy() != null ? h.getChangedBy().getFullName() : "System")
                .remark(h.getRemark())
                .changedAt(h.getChangedAt())
                .build())
            .collect(Collectors.toList());

        AiAnalysisResponse aiAnalysis = aiAnalysisRepository.findByComplaintId(complaintId)
            .map(a -> AiAnalysisResponse.builder()
                .id(a.getId())
                .suggestedCategory(a.getSuggestedCategory())
                .categoryConfidence(a.getCategoryConfidence())
                .suggestedPriority(a.getSuggestedPriority())
                .priorityConfidence(a.getPriorityConfidence())
                .suggestedDepartment(a.getSuggestedDepartment())
                .suggestedServiceUnit(a.getSuggestedServiceUnit())
                .summary(a.getSummary())
                .suggestedResolution(a.getSuggestedResolution())
                .sentiment(a.getSentiment())
                .urgencyLevel(a.getUrgencyLevel())
                .aiAvailable(a.isAiAvailable())
                .source("AI_ANALYZED")
                .build())
            .orElse(null);

        return ComplaintDetailResponse.builder()
            .complaint(ComplaintResponse.from(complaint))
            .timeline(timeline)
            .aiAnalysis(aiAnalysis)
            .resolutionNotes(complaint.getResolutionNotes())
            .actionTaken(complaint.getActionTaken())
            .materialsUsed(complaint.getMaterialsUsed())
            .build();
    }

    public List<ComplaintResponse> getStudentComplaints(User student) {
        return complaintRepository.findByStudentOrderByCreatedAtDesc(student)
            .stream().map(ComplaintResponse::from).collect(Collectors.toList());
    }

    public Page<ComplaintResponse> getHodComplaints(User hod, Pageable pageable) {
        if (hod.getDepartment() == null) return Page.empty();
        return complaintRepository.findByStudentDepartmentOrDepartment(hod.getDepartment().getId(), pageable)
            .map(ComplaintResponse::from);
    }

    public Page<ComplaintResponse> getStaffComplaints(User staff, Pageable pageable) {
        return complaintRepository.findByAssignedStaffOrderByCreatedAtDesc(staff, pageable)
            .map(ComplaintResponse::from);
    }

    public List<UserResponse> getStaffForServiceUnit(String serviceUnitStr) {
        if (serviceUnitStr != null && !serviceUnitStr.isBlank()) {
            ServiceUnit unit = ServiceUnit.fromString(serviceUnitStr);
            List<User> list = userRepository.findByRoleAndServiceUnitAndActiveTrue(RoleName.STAFF, unit);
            if (!list.isEmpty()) {
                return list.stream().map(UserResponse::from).collect(Collectors.toList());
            }
        }
        return userRepository.findByRoleAndActiveTrue(RoleName.STAFF)
            .stream().map(UserResponse::from).collect(Collectors.toList());
    }

    public Page<ComplaintResponse> getAllComplaints(ComplaintStatus status, Priority priority, Long departmentId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return complaintRepository.findWithFilters(status, priority, departmentId, pageable)
            .map(ComplaintResponse::from);
    }

    @Transactional
    public AiAnalysisResponse analyzeWithAi(String title, String description, Long complaintId) {
        AiAnalysisResponse response = aiService.analyzeComplaint(title, description);

        if (complaintId != null && response.isAiAvailable()) {
            complaintRepository.findById(complaintId).ifPresent(complaint -> {
                AiAnalysis analysis = AiAnalysis.builder()
                    .complaint(complaint)
                    .suggestedCategory(response.getSuggestedCategory())
                    .categoryConfidence(response.getCategoryConfidence())
                    .suggestedPriority(response.getSuggestedPriority())
                    .priorityConfidence(response.getPriorityConfidence())
                    .suggestedDepartment(response.getSuggestedDepartment())
                    .suggestedServiceUnit(response.getSuggestedServiceUnit())
                    .summary(response.getSummary())
                    .suggestedResolution(response.getSuggestedResolution())
                    .sentiment(response.getSentiment())
                    .urgencyLevel(response.getUrgencyLevel())
                    .aiAvailable(true)
                    .build();
                aiAnalysisRepository.save(analysis);
                complaint.setAiAnalyzed(true);
                complaintRepository.save(complaint);
            });
        }
        return response;
    }

    private Complaint getComplaintOrThrow(Long id) {
        return complaintRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", id));
    }

    private void saveHistory(Complaint complaint, ComplaintStatus from, ComplaintStatus to, User changedBy, String remark) {
        historyRepository.save(ComplaintStatusHistory.builder()
            .complaint(complaint)
            .fromStatus(from)
            .toStatus(to)
            .changedBy(changedBy)
            .remark(remark)
            .build());
    }

    private LocalDateTime computeDueDate(Priority priority) {
        LocalDateTime now = LocalDateTime.now();
        return switch (priority) {
            case CRITICAL -> now.plusHours(12);
            case HIGH -> now.plusHours(24);
            case MEDIUM -> now.plusHours(48);
            case LOW -> now.plusHours(72);
        };
    }
}
