package com.devhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Client-facing view of a {@link com.devhub.backend.model.User} — deliberately has no password
 * field, so the hash can never be serialized to JSON. This is also the {@code @AuthenticationPrincipal}
 * type installed by the JWT filter, so controllers read profile data straight off the principal.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private String permissions;
    private boolean enabled;
    private boolean notLocked;
    private LocalDateTime createdAt;
}
