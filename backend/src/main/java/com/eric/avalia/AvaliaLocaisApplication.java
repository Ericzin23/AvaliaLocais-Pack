package com.eric.avalia;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AvaliaLocaisApplication {
    public static void main(String[] args) {
        SpringApplication.run(AvaliaLocaisApplication.class, args);
    }
}
