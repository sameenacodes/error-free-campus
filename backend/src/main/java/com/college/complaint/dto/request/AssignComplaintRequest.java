package com.college.complaint.dto.request;

import lombok.Data;

@Data
public class AssignComplaintRequest {
    private Long staffId;
    private String serviceUnit;
    private String remark;
}
