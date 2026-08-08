package com.medastraq.twilio.service;

import com.medastraq.twilio.dto.ActivityLog;
import com.medastraq.twilio.entity.ActivityLogEntity;
import com.medastraq.twilio.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityHistoryStore {

    private final ActivityLogRepository repository;

    public ActivityHistoryStore(ActivityLogRepository repository) {
        this.repository = repository;
    }

    public void logActivity(ActivityLog log) {
        ActivityLogEntity entity = new ActivityLogEntity(
                null,
                log.getActionType(),
                log.getDescription(),
                log.getStatus(),
                LocalDateTime.ofInstant(Instant.ofEpochMilli(log.getTimestamp()), ZoneId.systemDefault()),
                log.getUserId()
        );
        repository.save(entity);
    }

    public List<ActivityLog> getHistory() {
        return repository.findAllByOrderByTimestampDesc().stream()
                .map(entity -> new ActivityLog(
                        String.valueOf(entity.getId()),
                        entity.getType(),
                        entity.getDescription(),
                        entity.getTimestamp().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli(),
                        entity.getStatus(),
                        entity.getMetadata()
                ))
                .collect(Collectors.toList());
    }
}
