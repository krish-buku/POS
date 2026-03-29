package com.bukukasir.business;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {
    "com.bukukasir.business",
    "com.bukukasir.common"
})
@EnableDiscoveryClient
public class UserBusinessServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserBusinessServiceApplication.class, args);
    }
}
