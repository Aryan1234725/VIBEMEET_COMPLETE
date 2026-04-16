package com.videocall.repository;

import com.videocall.entity.MeetingActivity;
import com.videocall.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeetingActivityRepository extends JpaRepository<MeetingActivity, Long> {
    
    List<MeetingActivity> findByUserOrderByDateDesc(User user);
}
