package com.gymLog.backend.repository;

import com.gymLog.backend.entity.GymLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GymLogRepository extends JpaRepository<GymLog, String> {
}
