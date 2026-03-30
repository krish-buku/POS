plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "0.9.0"
}

rootProject.name = "bukukasir-backend"

include(
    "shared:common",
    "shared:events",
    "services:api-gateway",
    "services:eureka-server",
    "services:auth-service",
    "services:user-business-service",
    "services:staff-service",
    "services:menu-service",
    "services:table-service",
    "services:order-service",
    "services:payment-service",
    "services:kitchen-service",
    "services:notification-service",
    "services:ai-image-service",
    "services:report-service",
    "services:receipt-service",
    "services:realtime-gateway",
    "services:file-storage-service",
    "services:shift-service",
    "services:bukukasir-api"
)
