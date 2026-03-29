package com.bukukasir.receipt;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {"com.bukukasir.receipt", "com.bukukasir.common"})
@EnableDiscoveryClient
public class ReceiptServiceApplication {
    public static void main(String[] args) { SpringApplication.run(ReceiptServiceApplication.class, args); }
}
