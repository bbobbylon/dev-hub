package com.devhub.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Domain user, mapped from the {@code users} table by {@code UserRowMapper}.
 * <p>
 * Carries the BCrypt-hashed password and the comma-separated {@code permissions} string that
 * {@code UserPrincipal} splits into granted authorities. The password is never exposed to clients —
 * controllers return a {@link com.devhub.backend.dto.UserDTO} instead.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class User {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    /** Role label (e.g. {@code ROLE_USER}). */
    private String role;
    /** Comma-separated authority strings (e.g. {@code READ:USER,UPDATE:USER}). */
    private String permissions;
    private boolean enabled;
    /** Maps to the {@code non_locked} column; getter is {@code isNotLocked()}. */
    private boolean notLocked;
    private LocalDateTime createdAt;
}
