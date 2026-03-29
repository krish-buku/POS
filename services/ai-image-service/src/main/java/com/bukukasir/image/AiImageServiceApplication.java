package com.bukukasir.image;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {"com.bukukasir.image", "com.bukukasir.common"})
@EnableDiscoveryClient
public class AiImageServiceApplication {
    public static void main(String[] args) { SpringApplication.run(AiImageServiceApplication.class, args); }
}
