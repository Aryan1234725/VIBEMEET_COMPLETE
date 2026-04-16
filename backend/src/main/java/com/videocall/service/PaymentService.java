package com.videocall.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.videocall.dto.ApiResponse;
import com.videocall.dto.CreateOrderRequest;
import com.videocall.dto.OrderResponse;
import com.videocall.dto.VerifyPaymentRequest;
import com.videocall.entity.Payment;
import com.videocall.entity.User;
import com.videocall.repository.PaymentRepository;
import com.videocall.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        try {
            User user = userService.getUserByToken(request.getToken());

            // Create Razorpay client
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            // Determine amount based on plan
            int amount = "PRO".equalsIgnoreCase(request.getPlan()) ? 49900 : 0; // 499 INR in paise

            if (amount == 0) {
                throw new RuntimeException("Invalid plan selected");
            }

            // Create order request
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "order_" + System.currentTimeMillis());

            // Create order
            Order order = razorpayClient.orders.create(orderRequest);

            // Save payment record
            Payment payment = new Payment();
            payment.setUserId(user.getId());
            payment.setRazorpayOrderId(order.get("id"));
            payment.setAmount(amount);
            payment.setCurrency("INR");
            payment.setPlan(User.SubscriptionPlan.valueOf(request.getPlan().toUpperCase()));
            payment.setStatus(Payment.PaymentStatus.PENDING);

            paymentRepository.save(payment);

            // Return order details
            return new OrderResponse(
                    order.get("id"),
                    razorpayKeyId,
                    amount,
                    "INR"
            );

        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create order: " + e.getMessage());
        }
    }

    @Transactional
    public ApiResponse verifyPayment(VerifyPaymentRequest request) {
        try {
            User user = userService.getUserByToken(request.getToken());

            // Find payment record
            Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpay_order_id())
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            // Verify signature
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpay_order_id());
            options.put("razorpay_payment_id", request.getRazorpay_payment_id());
            options.put("razorpay_signature", request.getRazorpay_signature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!isValid) {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                paymentRepository.save(payment);
                throw new RuntimeException("Payment verification failed");
            }

            // Update payment record
            payment.setRazorpayPaymentId(request.getRazorpay_payment_id());
            payment.setRazorpaySignature(request.getRazorpay_signature());
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            // Update user subscription
            user.setSubscriptionPlan(User.SubscriptionPlan.valueOf(request.getPlan().toUpperCase()));
            userRepository.save(user);

            return new ApiResponse("Payment successful! Your subscription has been upgraded to " + request.getPlan());

        } catch (RazorpayException e) {
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }
}
