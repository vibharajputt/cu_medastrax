package com.medastraq.twilio.controller;

import com.medastraq.twilio.dto.ApiResponse;
import com.medastraq.twilio.dto.CallRequest;
import com.medastraq.twilio.dto.SmsRequest;
import com.medastraq.twilio.service.TwilioService;
import com.medastraq.twilio.service.ActivityHistoryStore;
import com.medastraq.twilio.dto.ActivityLog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/twilio")

public class TwilioController {

    private static final Logger logger = LoggerFactory.getLogger(TwilioController.class);

    private final TwilioService twilioService;
    private final ActivityHistoryStore activityHistoryStore;

    @Autowired
    public TwilioController(TwilioService twilioService, ActivityHistoryStore activityHistoryStore) {
        this.twilioService = twilioService;
        this.activityHistoryStore = activityHistoryStore;
    }

    /**
     * POST /api/twilio/send-sms
     * Send an SMS using Twilio Java SDK
     */
    @PostMapping("/send-sms")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendSms(@Valid @RequestBody SmsRequest smsRequest) {
        logger.info("Received request for POST /api/twilio/send-sms to phone: {}", smsRequest.getPhoneNumber());

        try {
            String messageSid = twilioService.sendSms(smsRequest.getPhoneNumber(), smsRequest.getMessage());

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("messageSid", messageSid);
            responseData.put("toPhoneNumber", smsRequest.getPhoneNumber());
            responseData.put("status", "SENT");

            activityHistoryStore.logActivity(new ActivityLog(
                messageSid, "SEND_SMS", "Sent SMS to " + smsRequest.getPhoneNumber(), System.currentTimeMillis(), "SUCCESS", "SYSTEM"
            ));

            return ResponseEntity.ok(ApiResponse.success("SMS sent successfully", responseData));
        } catch (Exception e) {
            logger.error("Failed to send SMS to {}: {}", smsRequest.getPhoneNumber(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to send SMS: " + e.getMessage()));
        }
    }

    /**
     * POST /api/twilio/make-call
     * Make a voice call using Twilio Java SDK
     */
    @PostMapping("/make-call")
    public ResponseEntity<ApiResponse<Map<String, Object>>> makeCall(@Valid @RequestBody CallRequest callRequest) {
        logger.info("Received request for POST /api/twilio/make-call to phone: {}", callRequest.getPhoneNumber());

        try {
            String callSid = twilioService.makeCall(callRequest.getPhoneNumber());

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("callSid", callSid);
            responseData.put("toPhoneNumber", callRequest.getPhoneNumber());
            responseData.put("status", "CALL_INITIATED");
            responseData.put("messageSpoken", "Hello! This is a test call from MedAstraX.");

            activityHistoryStore.logActivity(new ActivityLog(
                callSid, "MAKE_CALL", "Initiated voice call to " + callRequest.getPhoneNumber(), System.currentTimeMillis(), "SUCCESS", "SYSTEM"
            ));

            return ResponseEntity.ok(ApiResponse.success("Voice call initiated successfully", responseData));
        } catch (Exception e) {
            logger.error("Failed to make call to {}: {}", callRequest.getPhoneNumber(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to make voice call: " + e.getMessage()));
        }
    }
}
