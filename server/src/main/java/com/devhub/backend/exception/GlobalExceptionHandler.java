package com.devhub.backend.exception;

import com.devhub.backend.model.HttpResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import static java.time.LocalDateTime.now;

/**
 * Centralised exception handling: turns thrown exceptions into the standard {@link HttpResponse}
 * envelope so clients always get a consistent JSON error shape.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<HttpResponse> handleApiException(ApiException e) {
        return build(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    /**
     * Bad password and unknown user are reported identically — never reveal whether an email exists.
     */
    @ExceptionHandler({BadCredentialsException.class, UsernameNotFoundException.class})
    public ResponseEntity<HttpResponse> handleBadCredentials() {
        return build(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<HttpResponse> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .orElse("Validation failed.");
        return build(HttpStatus.BAD_REQUEST, message);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<HttpResponse> handleGeneric(Exception e) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "An error occurred. Please try again.");
    }

    private ResponseEntity<HttpResponse> build(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(HttpResponse.builder()
                .timeStamp(now().toString())
                .statusCode(status.value())
                .status(status)
                .reason(status.getReasonPhrase())
                .message(message)
                .build());
    }
}
