package com.medastraq.twilio.controller;

import com.medastraq.twilio.dto.ApiResponse;
import com.medastraq.twilio.service.BackgroundJobService;
import com.medastraq.twilio.service.BackgroundJobService.JobState;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/jobs")
public class BackgroundJobController {

    @Autowired
    private BackgroundJobService jobService;

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<String>> submitJob(@RequestParam String name) {
        String jobId = jobService.submitJob(name);
        return ResponseEntity.ok(ApiResponse.success("Job submitted successfully", jobId));
    }

    // [BOUNTY 3] Background Async Upload Handler
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<String>> uploadFileAsync(@RequestParam("file") MultipartFile file) {
        // We submit the upload processing as a background job so it doesn't freeze the UI
        String jobName = "Processing Upload: " + file.getOriginalFilename();
        String jobId = jobService.submitJob(jobName);
        return ResponseEntity.ok(ApiResponse.success("File upload started in background", jobId));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<ApiResponse<JobState>> getJobStatus(@PathVariable String jobId) {
        JobState state = jobService.getJobStatus(jobId);
        if (state == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Job not found"));
        }
        return ResponseEntity.ok(ApiResponse.success("Job status retrieved", state));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobState>>> getAllJobs() {
        return ResponseEntity.ok(ApiResponse.success("All jobs retrieved", new ArrayList<>(jobService.getAllJobs().values())));
    }

    @PostMapping("/{jobId}/retry")
    public ResponseEntity<ApiResponse<String>> retryJob(@PathVariable String jobId) {
        JobState state = jobService.getJobStatus(jobId);
        if (state == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Job not found"));
        }
            return ResponseEntity.badRequest().body(ApiResponse.error("Only failed jobs can be retried"));
        }
        jobService.retryJob(jobId);
        return ResponseEntity.ok(ApiResponse.success("Job retry initiated", jobId));
    }
}
