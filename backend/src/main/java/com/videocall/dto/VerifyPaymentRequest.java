package com.videocall.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyPaymentRequest {
    
    @NotBlank(message = "Token is required")
    private String token;
    
    @NotBlank(message = "Plan is required")
    private String plan;
    
    @NotBlank(message = "Razorpay order ID is required")
    private String razorpay_order_id;
    
    @NotBlank(message = "Razorpay payment ID is required")
    private String razorpay_payment_id;
    
    @NotBlank(message = "Razorpay signature is required")
    private String razorpay_signature;
}
