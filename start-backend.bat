@echo off
set SPRING_PROFILES_ACTIVE=dev
set DB_USERNAME=postgres
set DB_PASSWORD=admin
mvn spring-boot:run
