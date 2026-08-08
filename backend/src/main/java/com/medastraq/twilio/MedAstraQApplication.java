package com.medastraq.twilio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MedAstraQApplication {
    public static void main(String[] args) {
        SpringApplication.run(MedAstraQApplication.class, args);
    }
}
