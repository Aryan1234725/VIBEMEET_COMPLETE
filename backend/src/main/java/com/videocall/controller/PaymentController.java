package com.videocall.controller;

import com.videocall.dto.ApiResponse;
import com.videocall.dto.CreateOrderRequest;
import com.videocall.dto.OrderResponse;
import com.videocall.dto.VerifyPaymentRequest;
import com.videocall.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create_order")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = paymentService.createOrder(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify_payment")
    public ResponseEntity<ApiResponse> verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
        ApiResponse response = paymentService.verifyPayment(request);
        return ResponseEntity.ok(response);
    }
}
