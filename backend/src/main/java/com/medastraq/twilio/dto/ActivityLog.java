package com.medastraq.twilio.dto;

public class ActivityLog {
    private String id;
    private String actionType;
    private String description;
    private long timestamp;
    private String status;
    private String userId;

    public ActivityLog() {}

    public ActivityLog(String id, String actionType, String description, long timestamp, String status, String userId) {
        this.id = id;
        this.actionType = actionType;
        this.description = description;
        this.timestamp = timestamp;
        this.status = status;
        this.userId = userId;
    }

    public String getId() { return id; }
    public String getActionType() { return actionType; }
    public String getDescription() { return description; }
    public long getTimestamp() { return timestamp; }
    public String getStatus() { return status; }
    public String getUserId() { return userId; }
}
