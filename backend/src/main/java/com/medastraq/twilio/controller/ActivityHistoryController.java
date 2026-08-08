package com.medastraq.twilio.controller;

import com.medastraq.twilio.dto.ActivityLog;
import com.medastraq.twilio.dto.ApiResponse;
import com.medastraq.twilio.service.ActivityHistoryStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/history")
public class ActivityHistoryController {

    @Autowired
    private ActivityHistoryStore historyStore;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityLog>>> getHistory() {
        return ResponseEntity.ok(ApiResponse.success("Activity history retrieved successfully", historyStore.getHistory()));
    }
}
