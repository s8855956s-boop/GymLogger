package com.gymLog.backend.servicce;

import com.gymLog.backend.entity.GymLog;
import com.gymLog.backend.entity.LogExercise;
import com.gymLog.backend.repository.GymLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GymLogService {
    @Autowired
    GymLogRepository repository;

    public List<GymLog> getAllGymLogs() {
        List<GymLog> gymLogs = new ArrayList<>();
        gymLogs.addAll(repository.findAll());
        return gymLogs;
    }

    public GymLog getGymLogById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void saveGymLog(List<GymLog> gymLogs) {
        repository.saveAll(gymLogs);
    }

    @Transactional
    public void synchronizeGymLog(List<GymLog> gymLogs) {
        List<Long> dateIds = gymLogs.stream()
                .map(GymLog::getDateId)
                .collect(Collectors.toList());

        List<GymLog> dbGymLogs = repository.findAllById(dateIds);

        Map<Long, GymLog> dbGymLogMap = dbGymLogs.stream()
                .collect(Collectors.toMap(GymLog::getDateId, Function.identity()));

        List<GymLog> toBeSaved = new ArrayList<>();

        for (GymLog incomingGymLog : gymLogs) {
            GymLog dbGymLog = dbGymLogMap.get(incomingGymLog.getDateId());

            // 不存在就直接新增
            if (dbGymLog == null) {
                // 補 parent 關聯
                if (incomingGymLog.getLogExercises() != null) {
                    for (LogExercise logExercise : incomingGymLog.getLogExercises()) {
                        logExercise.setGymLog(incomingGymLog);
                    }
                }
                toBeSaved.add(incomingGymLog);
                continue;
            }

            // 如果需要比對時間再決定是否覆蓋
            if (dbGymLog.getCreateDate().isBefore(incomingGymLog.getCreateDate())) {
                // 先清掉舊的 children
                dbGymLog.getLogExercises().clear();

                // 再放入新的 children
                if (incomingGymLog.getLogExercises() != null) {
                    for (LogExercise logExercise : incomingGymLog.getLogExercises()) {
                        logExercise.setGymLog(dbGymLog);
                        dbGymLog.getLogExercises().add(logExercise);
                    }
                }

                // 若 GymLog 本身還有其他欄位要更新，也在這裡 set
                dbGymLog.setUpdateDate(LocalDateTime.now());

                toBeSaved.add(dbGymLog);
            }
        }

        repository.saveAll(toBeSaved);
    }

    public void deleteGymLogById(Long id) {
        repository.deleteById(id);
    }
}
