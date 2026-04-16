package com.videocall.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddActivityRequest {
    
    @NotBlank(message = "Token is required")
    private String token;
    
    @NotBlank(message = "Meeting code is required")
    private String meeting_code;
}
