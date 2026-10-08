package com.college.complaint.dto.request;

import lombok.Data;

@Data
public class UpdateStatusRequest {
    private String status;
    private String remark;
}
