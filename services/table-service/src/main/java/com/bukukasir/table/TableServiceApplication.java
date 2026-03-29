package com.bukukasir.table;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {"com.bukukasir.table", "com.bukukasir.common"})
@EnableDiscoveryClient
public class TableServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(TableServiceApplication.class, args);
    }
}
