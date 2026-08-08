package com.medastraq.twilio.service;

import com.medastraq.twilio.dto.AgentRunLog;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.stream.Collectors;

@Service
public class AgentRunLogStore {
    // [BOUNTY 4] In-Memory Log Store for Observability Dashboard
    private final ConcurrentLinkedDeque<AgentRunLog> logs = new ConcurrentLinkedDeque<>();

    public void addLog(AgentRunLog log) {
        logs.addFirst(log);
        if (logs.size() > 500) {
            logs.removeLast(); // keep last 500 logs
        }
    }

    public List<AgentRunLog> getRecentLogs() {
        return logs.stream().collect(Collectors.toList());
    }
}
