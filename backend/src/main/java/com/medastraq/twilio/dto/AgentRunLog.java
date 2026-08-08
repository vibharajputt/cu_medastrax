package com.medastraq.twilio.dto;

public class AgentRunLog {
    private String id;
    private String endpoint;
    private String method;
    private long timestamp;
    private long latencyMs;
    private int statusCode;
    private String details;

    public AgentRunLog() {}

    public AgentRunLog(String id, String endpoint, String method, long timestamp, long latencyMs, int statusCode, String details) {
        this.id = id;
        this.endpoint = endpoint;
        this.method = method;
        this.timestamp = timestamp;
        this.latencyMs = latencyMs;
        this.statusCode = statusCode;
        this.details = details;
    }

    public String getId() { return id; }
    public String getEndpoint() { return endpoint; }
    public String getMethod() { return method; }
    public long getTimestamp() { return timestamp; }
    public long getLatencyMs() { return latencyMs; }
    public int getStatusCode() { return statusCode; }
    public String getDetails() { return details; }
}
