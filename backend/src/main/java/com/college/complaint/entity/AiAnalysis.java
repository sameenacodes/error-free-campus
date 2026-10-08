package com.college.complaint.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_analysis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", unique = true)
    private Complaint complaint;

    private String suggestedCategory;
    private Double categoryConfidence;

    private String suggestedPriority;
    private Double priorityConfidence;

    private String suggestedDepartment;
    private String suggestedServiceUnit;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String suggestedResolution;

    private String sentiment;
    private String urgencyLevel;

    private Long duplicateComplaintId;
    private Double duplicateSimilarity;

    @Column(columnDefinition = "TEXT")
    private String rawResponse;

    @Builder.Default
    private boolean aiAvailable = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
