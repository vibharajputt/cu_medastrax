package com.medastraq.twilio.service;

import com.medastraq.twilio.config.TwilioConfig;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import com.twilio.type.Twiml;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class TwilioService {

    private static final Logger logger = LoggerFactory.getLogger(TwilioService.class);

    private final TwilioConfig twilioConfig;

    @Autowired
    public TwilioService(TwilioConfig twilioConfig) {
        this.twilioConfig = twilioConfig;
    }

    /**
     * Send SMS using Twilio Java SDK
     *
     * @param phoneNumber Target E.164 Phone Number (e.g. +917988766566)
     * @param message     SMS Message Body
     * @return Message SID string
     */
    public String sendSms(String phoneNumber, String message) {
        logger.info("Initiating Twilio SMS dispatch to {} from {}", phoneNumber, twilioConfig.getPhoneNumber());
        
        try {
            PhoneNumber to = new PhoneNumber(phoneNumber);
            PhoneNumber from = new PhoneNumber(twilioConfig.getPhoneNumber());

            Message twilioMessage = Message.creator(to, from, message).create();

            logger.info("Twilio SMS sent successfully! Message SID: {}, Status: {}", 
                    twilioMessage.getSid(), twilioMessage.getStatus());
            
            return twilioMessage.getSid();
        } catch (Exception e) {
            logger.error("Error sending Twilio SMS to {}: {}", phoneNumber, e.getMessage(), e);
            throw new RuntimeException("Twilio SMS Dispatch Failed: " + e.getMessage(), e);
        }
    }

    /**
     * Make Outbound Voice Call using Twilio Java SDK and TwiML Voice Say
     *
     * @param phoneNumber Target E.164 Phone Number (e.g. +917988766566)
     * @return Call SID string
     */
    public String makeCall(String phoneNumber) {
        logger.info("Initiating Twilio Outbound Voice Call to {} from {}", phoneNumber, twilioConfig.getPhoneNumber());
        
        try {
            PhoneNumber to = new PhoneNumber(phoneNumber);
            PhoneNumber from = new PhoneNumber(twilioConfig.getPhoneNumber());

            String twimlMessage = "Hello! This is a verification call from MedAstraX Health Portal.";
            String twimletUrl = "http://twimlets.com/message?Message%5B0%5D=" + URLEncoder.encode(twimlMessage, StandardCharsets.UTF_8);
            
            URI twimletUri = URI.create(twimletUrl);

            Call call = Call.creator(to, from, twimletUri).create();

            logger.info("Twilio Voice Call initiated successfully! Call SID: {}, Status: {}", 
                    call.getSid(), call.getStatus());
            
            return call.getSid();
        } catch (Exception e) {
            logger.error("Error initiating Twilio Voice Call to {}: {}", phoneNumber, e.getMessage(), e);
            throw new RuntimeException("Twilio Voice Call Failed: " + e.getMessage(), e);
        }
    }
}
