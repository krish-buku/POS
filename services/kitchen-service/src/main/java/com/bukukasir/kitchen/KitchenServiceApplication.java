package com.bukukasir.kitchen;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {"com.bukukasir.kitchen", "com.bukukasir.common"})
@EnableDiscoveryClient
public class KitchenServiceApplication {
    public static void main(String[] args) { SpringApplication.run(KitchenServiceApplication.class, args); }
}
