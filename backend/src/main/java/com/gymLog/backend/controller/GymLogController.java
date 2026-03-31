package com.gymLog.backend.controller;

import com.gymLog.backend.entity.GymLog;
import com.gymLog.backend.servicce.GymLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/gymLog")
public class GymLogController {
    @Autowired
    private GymLogService service;

    @GetMapping
    public void getAllGymLog() {
        service.getAllGymLogs();
    }

    @GetMapping("/{id}")
    public void getGymLogById(@PathVariable String id) {
        service.getGymLogById(id);
    }

    @PostMapping
    public void saveGymLog(@RequestBody List<GymLog> gymLog) {
        service.saveGymLog(gymLog);
    }

    @DeleteMapping("/{id}")
    public void deleteGymLogById(@PathVariable String id) {
        service.deleteGymLogById(id);
    }
}
