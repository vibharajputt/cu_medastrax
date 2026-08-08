package com.medastraq.twilio.controller;

import com.medastraq.twilio.dto.AgentRunLog;
import com.medastraq.twilio.dto.ApiResponse;
import com.medastraq.twilio.service.AgentRunLogStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/observability")
public class ObservabilityController {

    @Autowired
    private AgentRunLogStore logStore;

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<AgentRunLog>>> getLogs() {
        return ResponseEntity.ok(ApiResponse.success("Agent logs retrieved successfully", logStore.getRecentLogs()));
    }
}
