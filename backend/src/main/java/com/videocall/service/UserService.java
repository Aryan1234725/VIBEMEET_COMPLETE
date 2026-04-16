package com.videocall.service;

import com.videocall.dto.*;
import com.videocall.entity.MeetingActivity;
import com.videocall.entity.User;
import com.videocall.repository.MeetingActivityRepository;
import com.videocall.repository.UserRepository;
import com.videocall.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final MeetingActivityRepository meetingActivityRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public ApiResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setSubscriptionPlan(User.SubscriptionPlan.FREE);

        userRepository.save(user);

        return new ApiResponse("User registered successfully");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getUsername());

        return new AuthResponse(token, "Login successful");
    }

    @Transactional
    public ApiResponse addToActivity(AddActivityRequest request) {
        String username = jwtUtil.extractUsername(request.getToken());
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MeetingActivity activity = new MeetingActivity();
        activity.setMeetingCode(request.getMeeting_code());
        activity.setUser(user);

        meetingActivityRepository.save(activity);

        return new ApiResponse("Activity added successfully");
    }

    public List<MeetingActivityResponse> getAllActivity(String token) {
        String username = jwtUtil.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<MeetingActivity> activities = meetingActivityRepository.findByUserOrderByDateDesc(user);

        return activities.stream()
                .map(activity -> new MeetingActivityResponse(
                        activity.getId(),
                        activity.getMeetingCode(),
                        activity.getDate()
                ))
                .collect(Collectors.toList());
    }

    public User getUserByToken(String token) {
        String username = jwtUtil.extractUsername(token);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
