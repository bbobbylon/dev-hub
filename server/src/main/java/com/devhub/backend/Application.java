package com.devhub.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Application entry point.
 * <p>
 * {@code @SpringBootApplication} triggers component scanning from this package downward and
 * enables autoconfiguration. The {@link BCryptPasswordEncoder} bean defined here is injected
 * wherever passwords are hashed (registration) or verified (the {@code DaoAuthenticationProvider}).
 */
@SpringBootApplication
public class Application {

    /** BCrypt work factor (10-12 typical; higher is slower but stronger). */
    private static final int BCRYPT_STRENGTH = 12;

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    /**
     * Password encoder bean shared across the app.
     *
     * @return a BCrypt encoder at {@link #BCRYPT_STRENGTH}
     */
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(BCRYPT_STRENGTH);
    }
}
