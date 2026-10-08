package com.college.complaint.config;

import com.college.complaint.entity.*;
import com.college.complaint.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final EscalationRepository escalationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and initializing academic departments, categories, and seed data...");

        // --- Academic Departments (Always ensured) ---
        Department cse = findOrCreateDept("Computer Science & Engineering", "CSE");
        Department ece = findOrCreateDept("Electronics & Communication", "ECE");
        Department eee = findOrCreateDept("Electrical & Electronics", "EEE");
        Department mech = findOrCreateDept("Mechanical Engineering", "MECH");
        Department civil = findOrCreateDept("Civil Engineering", "CIVIL");
        Department it = findOrCreateDept("Information Technology", "IT");
        Department aids = findOrCreateDept("AI & Data Science", "AI&DS");
        Department adminDept = findOrCreateDept("Administration", "ADMIN");

        // --- Complaint Categories (Always ensured) ---
        Category infra = findOrCreateCat("Infrastructure");
        Category electrical = findOrCreateCat("Electrical");
        Category plumbing = findOrCreateCat("Plumbing");
        Category cleanliness = findOrCreateCat("Cleanliness");
        Category academic = findOrCreateCat("Academic");
        Category hostel = findOrCreateCat("Hostel");
        Category transport = findOrCreateCat("Transport");
        Category lab = findOrCreateCat("Laboratory");
        Category internet = findOrCreateCat("Internet / Wi-Fi");
        Category security = findOrCreateCat("Security");
        Category other = findOrCreateCat("Other");

        if (userRepository.count() > 0) {
            log.info("Users already seeded ({} users found). Skipping user creation.", userRepository.count());
            return;
        }

        log.info("Seeding users, department HODs, service units, staff, and initial sample complaints...");

        // --- System Administrators & Leadership ---
        User adminUser = saveUser("System", "Administrator", "admin@college.edu", "Admin@123", RoleName.ADMIN, adminDept, null, "ADM-2024-001", "9876543210");
        User principal = saveUser("Dr. Rajesh", "Kumar", "principal@college.edu", "Principal@123", RoleName.PRINCIPAL, adminDept, null, "PRN-2024-001", "9876543211");

        // --- Department HODs (Every academic department has its HOD) ---
        User hodCse = saveUser("Prof. Suresh", "Menon", "hod.cse@college.edu", "Hod@123", RoleName.HOD, cse, null, "HOD-CSE-001", "9876543212");
        User hodCseLegacy = saveUser("Prof. Suresh", "Menon", "hod@college.edu", "Hod@123", RoleName.HOD, cse, null, "HOD-CSE-002", "9876543213");
        User hodEce = saveUser("Prof. Priya", "Sharma", "hod.ece@college.edu", "Hod@123", RoleName.HOD, ece, null, "HOD-ECE-001", "9876543214");
        User hodEee = saveUser("Prof. Ramesh", "Verma", "hod.eee@college.edu", "Hod@123", RoleName.HOD, eee, null, "HOD-EEE-001", "9876543215");
        User hodMech = saveUser("Prof. Joseph", "Kurian", "hod.mech@college.edu", "Hod@123", RoleName.HOD, mech, null, "HOD-MEC-001", "9876543216");
        User hodCivil = saveUser("Prof. Sunita", "Patil", "hod.civil@college.edu", "Hod@123", RoleName.HOD, civil, null, "HOD-CIV-001", "9876543217");
        User hodIt = saveUser("Prof. Amit", "Chatterjee", "hod.it@college.edu", "Hod@123", RoleName.HOD, it, null, "HOD-IT-001", "9876543218");
        User hodAids = saveUser("Prof. Deepa", "Narayanan", "hod.aids@college.edu", "Hod@123", RoleName.HOD, aids, null, "HOD-ADS-001", "9876543219");

        // --- Service Unit Staff (Dedicated staff for each campus service unit) ---
        User staffLibrary = saveUser("Ravi", "Library", "library.staff@college.edu", "Staff@123", RoleName.STAFF, null, ServiceUnit.LIBRARY, "STF-LIB-001", "9876543220");
        User staffHostel = saveUser("Suresh", "Hostel", "hostel.staff@college.edu", "Staff@123", RoleName.STAFF, null, ServiceUnit.HOSTEL, "STF-HST-001", "9876543221");
        User staffIt = saveUser("Rajesh", "IT-Support", "it.staff@college.edu", "Staff@123", RoleName.STAFF, null, ServiceUnit.IT_SUPPORT, "STF-ITS-001", "9876543222");
        User staffLab = saveUser("Vinod", "Lab-Support", "lab.staff@college.edu", "Staff@123", RoleName.STAFF, null, ServiceUnit.LAB_SUPPORT, "STF-LAB-001", "9876543223");
        User staffElectrical = saveUser("Anand", "Electrical", "electrical.staff@college.edu", "Staff@123", RoleName.STAFF, null, ServiceUnit.ELECTRICAL, "STF-ELE-001", "9876543224");
        User staffPlumbing = saveUser("Murugan", "Plumbing", "plumbing.staff@college.edu", "Staff@123", RoleName.STAFF, null, ServiceUnit.PLUMBING, "STF-PLM-001", "9876543225");
        User staffMaintenance = saveUser("Mohan", "Maintenance", "maintenance.staff@college.edu", "Staff@123", RoleName.STAFF, null, ServiceUnit.MAINTENANCE, "STF-MNT-001", "9876543226");
        User staffMaintenanceLegacy = saveUser("Mohan", "Kumar", "staff@college.edu", "Staff@123", RoleName.STAFF, null, ServiceUnit.MAINTENANCE, "STF-MNT-002", "9876543227");
        User staffTransport = saveUser("Kumar", "Transport", "transport.staff@college.edu", "Staff@123", RoleName.STAFF, null, ServiceUnit.TRANSPORT, "STF-TRN-001", "9876543228");
        User staffSecurity = saveUser("Balan", "Security", "security.staff@college.edu", "Staff@123", RoleName.STAFF, null, ServiceUnit.SECURITY, "STF-SEC-001", "9876543229");

        // --- Students ---
        User studentSameena = saveUser("Sameena", "Begum", "sameena.cse@college.edu", "Student@123", RoleName.STUDENT, cse, null, "STU-CSE-001", "9876543230");
        User studentCse = saveUser("Arun", "Krishnan", "student@college.edu", "Student@123", RoleName.STUDENT, cse, null, "STU-CSE-002", "9876543231");
        User studentEce = saveUser("Meera", "Nair", "student.ece@college.edu", "Student@123", RoleName.STUDENT, ece, null, "STU-ECE-001", "9876543232");
        User studentMech = saveUser("Vikram", "Patel", "student.mech@college.edu", "Student@123", RoleName.STUDENT, mech, null, "STU-MEC-001", "9876543233");

        // --- Sample Complaints Matching Workflow ---
        Complaint testComplaint1 = createComplaint(
            "Library AC is not working",
            "The air conditioner on the second floor of the Central Library is leaking water and not cooling. Study atmosphere is disrupted.",
            infra, cse, ServiceUnit.LIBRARY, ServiceUnit.LIBRARY, Priority.HIGH, ComplaintStatus.RESOLVED,
            studentSameena, hodCse, staffLibrary, "Central Library, 2nd Floor",
            LocalDateTime.now().minusDays(2), LocalDateTime.now().minusHours(4), false,
            "Replaced compressor thermal relay and refilled refrigerant gas. Tested temperature down to 21C.",
            "Replaced thermal relay, cleaned dust filters, sealed drain pipe",
            "Thermal Relay 25A, R410A Refrigerant 500g, Sealant Tape"
        );

        createComplaint(
            "CSE Lab projector is not working",
            "The HDMI projector in CSE Main Lab 2 has an optical ballast fault and will not power on for lab demonstrations.",
            lab, cse, ServiceUnit.LAB_SUPPORT, ServiceUnit.LAB_SUPPORT, Priority.MEDIUM, ComplaintStatus.ASSIGNED,
            studentCse, hodCse, staffLab, "CSE Main Lab 2",
            LocalDateTime.now().minusDays(1), null, false,
            null, null, null
        );

        createComplaint(
            "Library reading table chair is broken",
            "Wooden study chair leg broken at reading table 4 in central reference library.",
            infra, ece, ServiceUnit.LIBRARY, ServiceUnit.LIBRARY, Priority.LOW, ComplaintStatus.PENDING,
            studentEce, hodEce, null, "Library Reading Section, Table 4",
            LocalDateTime.now().minusHours(6), null, false,
            null, null, null
        );

        createComplaint("Hostel Block C Power Backup Failure", "UPS inverter not switching on during evening grid load shedding.", electrical, cse, ServiceUnit.ELECTRICAL, ServiceUnit.ELECTRICAL, Priority.HIGH, ComplaintStatus.IN_PROGRESS, studentSameena, hodCse, staffElectrical, "Hostel Block C", LocalDateTime.now().minusDays(3), null, false, null, null, null);
        createComplaint("Hostel Water Tap Broken", "Continuous tap leak causing slippery bathroom floor in hostel floor 1.", plumbing, cse, ServiceUnit.PLUMBING, ServiceUnit.PLUMBING, Priority.MEDIUM, ComplaintStatus.RESOLVED, studentSameena, hodCse, staffPlumbing, "Hostel Block A, Washroom 102", LocalDateTime.now().minusDays(4), LocalDateTime.now().minusDays(3), false, "Replaced 0.5 inch brass spindle tap and washer.", "Installed new washer and brass tap", "1/2 inch Brass Tap, Teflon Tape");
        createComplaint("Wi-Fi Router Dead in ECE Floor 2", "AP-ECE-04 drops connections every 10 minutes during classes.", internet, ece, ServiceUnit.IT_SUPPORT, ServiceUnit.IT_SUPPORT, Priority.HIGH, ComplaintStatus.IN_PROGRESS, studentEce, hodEce, staffIt, "ECE Floor 2", LocalDateTime.now().minusDays(2), null, false, null, null, null);
        createComplaint("College Bus Route 7 Mechanical Breakdown", "College bus route 7 has broken down twice in one week.", transport, mech, ServiceUnit.TRANSPORT, ServiceUnit.TRANSPORT, Priority.HIGH, ComplaintStatus.RESOLVED, studentMech, hodMech, staffTransport, "Bus Depot", LocalDateTime.now().minusDays(5), LocalDateTime.now().minusDays(4), false, "Replaced fuel injector and serviced fuel line pump.", "Serviced fuel line", "Fuel filter, Hose pipe");
        createComplaint("Main Campus Gate Security Lighting Defect", "High-intensity floodlights at gate entrance flickering.", security, cse, ServiceUnit.SECURITY, ServiceUnit.SECURITY, Priority.MEDIUM, ComplaintStatus.ASSIGNED, studentCse, hodCse, staffSecurity, "Main Security Gate", LocalDateTime.now().minusDays(1), null, false, null, null, null);

        // Notifications
        notificationRepository.save(Notification.builder().user(studentSameena).title("Complaint Resolved").message("Your complaint #1 'Library AC is not working' has been resolved by Ravi Library.").type("SUCCESS").complaintId(testComplaint1.getId()).build());
        notificationRepository.save(Notification.builder().user(hodCse).title("New Department Complaint").message("New complaint submitted by Sameena Begum (CSE): 'Library AC is not working'").type("INFO").complaintId(testComplaint1.getId()).build());
        notificationRepository.save(Notification.builder().user(staffLibrary).title("New Assignment").message("Complaint #1 'Library AC is not working' has been assigned to you.").type("INFO").complaintId(testComplaint1.getId()).build());
        notificationRepository.save(Notification.builder().user(principal).title("System Live").message("All department HODs and campus service units are active in Error-Free Campus.").type("SUCCESS").build());

        // Audit Logs
        auditLogRepository.save(AuditLog.builder().action("SYSTEM_INIT").description("Academic departments, HODs, and Service Units provisioned").performedBy(adminUser).entityType("System").entityId("0").build());

        log.info("DataInitializer completed successfully.");
    }

    private Department findOrCreateDept(String name, String code) {
        return departmentRepository.findByCode(code)
            .orElseGet(() -> departmentRepository.save(
                Department.builder().name(name).code(code).description(name + " Department").active(true).build()
            ));
    }

    private Category findOrCreateCat(String name) {
        return categoryRepository.findByName(name)
            .orElseGet(() -> categoryRepository.save(
                Category.builder().name(name).description(name + " Issues").active(true).build()
            ));
    }

    private User saveUser(String first, String last, String email, String pass, RoleName role, Department dept, ServiceUnit su, String empId, String phone) {
        return userRepository.findByEmail(email).orElseGet(() ->
            userRepository.save(User.builder()
                .firstName(first)
                .lastName(last)
                .email(email)
                .password(passwordEncoder.encode(pass))
                .role(role)
                .department(dept)
                .serviceUnit(su)
                .employeeId(empId)
                .phone(phone)
                .active(true)
                .build())
        );
    }

    private Complaint createComplaint(String title, String description, Category category, Department studentDept,
                                      ServiceUnit su, ServiceUnit aiSu,
                                      Priority priority, ComplaintStatus status, User student, User hodUser, User staffUser,
                                      String location, LocalDateTime created, LocalDateTime resolved, boolean isOverdue,
                                      String resolutionNotes, String actionTaken, String materialsUsed) {
        Complaint c = Complaint.builder()
            .title(title)
            .description(description)
            .category(category)
            .department(studentDept)
            .studentDepartment(studentDept)
            .serviceUnit(su)
            .aiSuggestedServiceUnit(aiSu)
            .priority(priority)
            .status(status)
            .student(student)
            .assignedHod(hodUser)
            .assignedStaff(staffUser)
            .location(location)
            .aiAnalyzed(true)
            .dueDate(created.plusHours(priority == Priority.CRITICAL ? 12 : priority == Priority.HIGH ? 24 : 48))
            .overdue(isOverdue)
            .resolutionNotes(resolutionNotes)
            .actionTaken(actionTaken)
            .materialsUsed(materialsUsed)
            .createdAt(created)
            .updatedAt(resolved != null ? resolved : created)
            .resolvedAt(resolved)
            .build();
        c = complaintRepository.save(c);

        historyRepository.save(ComplaintStatusHistory.builder()
            .complaint(c)
            .fromStatus(null)
            .toStatus(ComplaintStatus.PENDING)
            .changedBy(student)
            .remark("Complaint submitted to " + (studentDept != null ? studentDept.getName() : "Department") + " HOD")
            .changedAt(created)
            .build());

        if (status == ComplaintStatus.ASSIGNED || status == ComplaintStatus.IN_PROGRESS || status == ComplaintStatus.RESOLVED) {
            historyRepository.save(ComplaintStatusHistory.builder()
                .complaint(c)
                .fromStatus(ComplaintStatus.PENDING)
                .toStatus(ComplaintStatus.ASSIGNED)
                .changedBy(hodUser)
                .remark("Assigned to " + (staffUser != null ? staffUser.getFullName() : "Staff") + " (" + (su != null ? su.getDisplayName() : "") + ")")
                .changedAt(created.plusHours(1))
                .build());
        }

        if (status == ComplaintStatus.IN_PROGRESS || status == ComplaintStatus.RESOLVED) {
            historyRepository.save(ComplaintStatusHistory.builder()
                .complaint(c)
                .fromStatus(ComplaintStatus.ASSIGNED)
                .toStatus(ComplaintStatus.IN_PROGRESS)
                .changedBy(staffUser)
                .remark("Staff commenced work on the issue")
                .changedAt(created.plusHours(3))
                .build());
        }

        if (status == ComplaintStatus.RESOLVED) {
            historyRepository.save(ComplaintStatusHistory.builder()
                .complaint(c)
                .fromStatus(ComplaintStatus.IN_PROGRESS)
                .toStatus(ComplaintStatus.RESOLVED)
                .changedBy(staffUser)
                .remark(resolutionNotes != null ? resolutionNotes : "Issue resolved and verified")
                .changedAt(resolved != null ? resolved : created.plusDays(1))
                .build());
        }

        return c;
    }
}
