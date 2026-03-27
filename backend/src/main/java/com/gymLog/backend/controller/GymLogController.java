package com.gymLog.backend.controller;

import com.gymLog.backend.entity.GymLog;
import com.gymLog.backend.servicce.GymLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/gymLog")
public class GymLogController {
    @Autowired
    private GymLogService service;

    @GetMapping
    public void getAllGymLog() {
        service.getAllGymLogs();
    }

    @GetMapping("/{id}")
    public void getGymLogById(String id) {
        service.getGymLogById(id);
    }

    @PostMapping
    public void saveGymLog(GymLog gymLog) {
        service.saveGymLog(gymLog);
    }

    @DeleteMapping
    public void deleteGymLogById(String id) {
        service.deleteGymLogById(id);
    }
}
