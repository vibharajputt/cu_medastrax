package com.medastraq.twilio.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BackgroundJobService {
    private static final Logger logger = LoggerFactory.getLogger(BackgroundJobService.class);
    private final Map<String, JobState> jobStore = new ConcurrentHashMap<>();

    public static class JobState {
        public String id;
        public String name;
        public String result;
        public String errorReason;
        public long createdAt;
    }

    public String submitJob(String name) {
        String jobId = java.util.UUID.randomUUID().toString();
        JobState state = new JobState();
        state.id = jobId;
        state.name = name;
        state.status = "PENDING";
        state.createdAt = System.currentTimeMillis();
        jobStore.put(jobId, state);
        
        processJobAsync(jobId);
        return jobId;
    }

    @Async
    public void processJobAsync(String jobId) {
        JobState state = jobStore.get(jobId);
        if (state == null) return;
        
        try {
            logger.info("Executing background job: {}", state.name);
            Thread.sleep(3000);
            
            if (!state.name.contains("Upload") && Math.random() < 0.3) {
                throw new RuntimeException("Background processing request timed out");
            }
            
            state.status = "COMPLETED";
            state.result = "Generated comprehensive summary report successfully.";
        } catch (Exception e) {
            state.errorReason = e.getMessage();
        }
    }

    public JobState getJobStatus(String jobId) {
        return jobStore.get(jobId);
    }

    public void retryJob(String jobId) {
        JobState state = jobStore.get(jobId);
            state.status = "PENDING";
            state.errorReason = null;
            processJobAsync(jobId);
        }
    }
    
    public Map<String, JobState> getAllJobs() {
        return jobStore;
    }
}
