package com.college.complaint.dto.request;

import lombok.Data;

@Data
public class ResolutionRequest {
    private String resolutionNotes;
    private String actionTaken;
    private String materialsUsed;
}
