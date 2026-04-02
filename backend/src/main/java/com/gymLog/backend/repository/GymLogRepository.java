package com.gymLog.backend.repository;

import com.gymLog.backend.entity.GymLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GymLogRepository extends JpaRepository<GymLog, Long> {
    @Query(value = "SELECT date_id, create_date FROM gym_log WHERE date_id IN (:dateIds)", nativeQuery = true)
    List<Object[]> getExistingGymLogs(List<Long> dateIds);
}
