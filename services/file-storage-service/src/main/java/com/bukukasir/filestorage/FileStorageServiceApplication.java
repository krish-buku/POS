package com.bukukasir.filestorage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(scanBasePackages = {"com.bukukasir.filestorage", "com.bukukasir.common"})
@EnableDiscoveryClient
public class FileStorageServiceApplication {
    public static void main(String[] args) { SpringApplication.run(FileStorageServiceApplication.class, args); }
}
