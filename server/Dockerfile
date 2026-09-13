# syntax=docker/dockerfile:1
#
# Build context is this directory (server/). See README.md's "Deploying" section for the
# mysql-ca.pem prerequisite this build expects and how to get it from your MySQL host.

# --- Build the jar ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src src
RUN mvn -q -B package -DskipTests

# --- Bake the MySQL host's CA into a truststore ---
# mysql-ca.pem is downloaded from the MySQL host's console (e.g. Aiven's per-service "CA
# certificate" download) and never committed — see .gitignore and README.md. Strip any CRLF
# line endings first: keytool rejects an otherwise-valid PEM if it was re-saved with them
# (easy to hit if the file ever passes through a Windows text editor).
FROM eclipse-temurin:21-jre AS truststore
COPY mysql-ca.pem /tmp/mysql-ca.pem
RUN tr -d '\r' < /tmp/mysql-ca.pem > /tmp/mysql-ca.normalized.pem && \
    keytool -importcert -noprompt -alias mysql-ca \
      -file /tmp/mysql-ca.normalized.pem \
      -keystore /truststore.p12 -storetype PKCS12 \
      -storepass changeit

# --- Runtime ---
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/backend-0.0.1-SNAPSHOT.jar app.jar
COPY --from=truststore /truststore.p12 /app/truststore.p12
ENV SPRING_ACTIVE_PROFILES=prod
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
