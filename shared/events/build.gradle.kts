plugins {
    java
    id("io.spring.dependency-management")
}

val springBootVersion = "3.4.1"

dependencyManagement {
    imports {
        mavenBom("org.springframework.boot:spring-boot-dependencies:$springBootVersion")
    }
}

dependencies {
    implementation(project(":shared:common"))
    implementation("com.fasterxml.jackson.core:jackson-databind")
}
