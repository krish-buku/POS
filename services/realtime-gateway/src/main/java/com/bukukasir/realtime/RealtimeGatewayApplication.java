package com.bukukasir.realtime;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {"com.bukukasir.realtime", "com.bukukasir.common"})
@EnableDiscoveryClient
public class RealtimeGatewayApplication {
    public static void main(String[] args) { SpringApplication.run(RealtimeGatewayApplication.class, args); }
}
