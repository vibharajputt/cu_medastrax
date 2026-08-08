package com.medastraq.twilio.config;

import com.twilio.Twilio;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TwilioConfig {

    private static final Logger logger = LoggerFactory.getLogger(TwilioConfig.class);

    @Value("${twilio.accountSid}")
    private String accountSid;

    @Value("${twilio.authToken}")
    private String authToken;

    @Value("${twilio.phoneNumber}")
    private String phoneNumber;

    @PostConstruct
    public void initTwilio() {
        if (accountSid != null && !accountSid.startsWith("AC_your_") && authToken != null && !authToken.startsWith("your_")) {
            Twilio.init(accountSid, authToken);
            logger.info("Twilio client initialized successfully with Account SID: {}", accountSid);
        } else {
            logger.warn("Twilio credentials in application.properties are placeholders. Twilio.init() skipped until valid credentials are provided.");
        }
    }

    public String getAccountSid() {
        return accountSid;
    }

    public void setAccountSid(String accountSid) {
        this.accountSid = accountSid;
    }

    public String getAuthToken() {
        return authToken;
    }

    public void setAuthToken(String authToken) {
        this.authToken = authToken;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
