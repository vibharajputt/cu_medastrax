package com.medastraq.twilio.config;

import com.medastraq.twilio.dto.AgentRunLog;
import com.medastraq.twilio.service.AgentRunLogStore;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

@Component
public class ObservabilityInterceptor implements HandlerInterceptor {

    @Autowired
    private AgentRunLogStore logStore;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute("startTime", System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        if (request.getRequestURI().contains("/api/twilio") || request.getRequestURI().contains("/api/ai")) {
            long startTime = (Long) request.getAttribute("startTime");
            long latency = System.currentTimeMillis() - startTime;
            
            AgentRunLog runLog = new AgentRunLog(
                UUID.randomUUID().toString(),
                request.getRequestURI(),
                request.getMethod(),
                System.currentTimeMillis(),
                latency,
                response.getStatus(),
                ex != null ? "Failed: " + ex.getMessage() : "Executed Successfully"
            );
            
            logStore.addLog(runLog);
        }
    }
}
