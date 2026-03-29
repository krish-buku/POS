package com.bukukasir.shift;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {
    "com.bukukasir.shift",
    "com.bukukasir.common"
})
@EnableDiscoveryClient
public class ShiftServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShiftServiceApplication.class, args);
    }
}
