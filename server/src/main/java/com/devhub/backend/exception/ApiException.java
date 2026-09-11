package com.devhub.backend.exception;

/**
 * Generic application exception for expected, client-facing error conditions (e.g. a failed
 * business rule). Mapped to a clean HTTP response by {@link GlobalExceptionHandler}.
 */
public class ApiException extends RuntimeException {

    public ApiException(String message) {
        super(message);
    }

    public ApiException() {
        super("An error occurred. Please try again.");
    }
}
