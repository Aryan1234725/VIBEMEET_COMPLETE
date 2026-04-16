package com.videocall.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionPlan subscriptionPlan = SubscriptionPlan.FREE;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MeetingActivity> meetingActivities = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ── Profile fields ─────────────────────────────────────────────
    private String displayName;

    @Column(length = 500)
    private String bio;

    private String avatarUrl;

    private String timezone = "Asia/Kolkata";

    private String location;

    private String website;

    // ── Notification preferences ───────────────────────────────────
    private boolean emailNotifications = true;
    private boolean meetingReminders   = true;
    private boolean chatNotifications  = true;

    // ── OAuth fields ───────────────────────────────────────────────
    private String email;       // ← NEW
    private String provider;    // ← NEW  "local", "google", "github"
    private String providerId;  // ← NEW  Google sub / GitHub id

    public enum SubscriptionPlan {
        FREE, PRO
    }
}