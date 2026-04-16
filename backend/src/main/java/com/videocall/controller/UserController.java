package com.videocall.controller;

import com.videocall.dto.*;
import com.videocall.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        ApiResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add_to_activity")
    public ResponseEntity<ApiResponse> addToActivity(@Valid @RequestBody AddActivityRequest request) {
        ApiResponse response = userService.addToActivity(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/get_all_activity")
    public ResponseEntity<List<MeetingActivityResponse>> getAllActivity(@RequestParam String token) {
        List<MeetingActivityResponse> activities = userService.getAllActivity(token);
        return ResponseEntity.ok(activities);
    }
}
