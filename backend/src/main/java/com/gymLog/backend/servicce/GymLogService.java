package com.gymLog.backend.servicce;

import com.gymLog.backend.entity.GymLog;
import com.gymLog.backend.repository.GymLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GymLogService {
    @Autowired
    GymLogRepository repository;

    public List<GymLog> getAllGymLogs() {
        List<GymLog> gymLogs = new ArrayList<>();
        gymLogs.addAll(repository.findAll());
        return gymLogs;
    }

    public GymLog getGymLogById(String id) {
        return repository.findById(id).orElse(null);
    }

    public void saveGymLog(GymLog gymLog) {
        repository.save(gymLog);
    }

    public void deleteGymLogById(String id){
        repository.deleteById(id);
    }
}
