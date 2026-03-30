package com.bukukasir;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.bukukasir")
public class BukukasirApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(BukukasirApiApplication.class, args);
    }
}
